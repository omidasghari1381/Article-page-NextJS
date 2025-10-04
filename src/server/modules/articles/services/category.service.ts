// src/server/modules/categories/CategoryService.ts
import { DataSource, SelectQueryBuilder } from "typeorm";
import { ArticleCategory } from "../entities/articleCategory.entity";
import z from "zod";

export type CategoryListFilters = {
  q?: string;
  parentId?: string;
  hasParent?: "yes" | "no"; // yes=فقط زیرشاخه، no=فقط ریشه
  depthMin?: number;
  depthMax?: number;
  createdFrom?: string; // ISO (YYYY-MM-DD)
  createdTo?: string; // ISO
  sortBy?: "createdAt" | "updatedAt" | "name" | "slug" | "depth";
  sortDir?: "ASC" | "DESC";
  page?: number;
  pageSize?: number;
};

export class CategoryService {
  constructor(private ds: DataSource) {}

  private baseQB(): SelectQueryBuilder<ArticleCategory> {
    return this.ds
      .getRepository(ArticleCategory)
      .createQueryBuilder("c")
      .leftJoinAndSelect("c.parent", "p");
  }

  private async getAncestorsChain(catId: string): Promise<ArticleCategory[]> {
    const repo = this.ds.getRepository(ArticleCategory);
    const chain: ArticleCategory[] = [];
    let current = await repo.findOne({
      where: { id: catId },
      relations: ["parent"],
    });
    while (current?.parent) {
      chain.push(current.parent);
      current = await repo.findOne({
        where: { id: current.parent.id },
        relations: ["parent"],
      });
    }
    return chain;
  }

  async listWithFilters(f: CategoryListFilters) {
    const {
      q,
      parentId,
      hasParent,
      depthMin,
      depthMax,
      createdFrom,
      createdTo,
      sortBy = "createdAt",
      sortDir = "DESC",
      page = 1,
      pageSize = 20,
    } = f;

    const qb = this.baseQB();

    if (q) {
      qb.andWhere(
        "(c.name LIKE :q OR c.slug LIKE :q OR c.description LIKE :q)",
        { q: `%${q}%` }
      );
    }

    if (parentId) {
      qb.andWhere("p.id = :parentId", { parentId });
    }

    if (hasParent === "yes") {
      qb.andWhere("c.parentId IS NOT NULL");
    } else if (hasParent === "no") {
      qb.andWhere("c.parentId IS NULL");
    }

    if (typeof depthMin === "number") {
      qb.andWhere("c.depth >= :depthMin", { depthMin });
    }
    if (typeof depthMax === "number") {
      qb.andWhere("c.depth <= :depthMax", { depthMax });
    }

    if (createdFrom) {
      qb.andWhere("DATE(c.createdAt) >= :createdFrom", { createdFrom });
    }
    if (createdTo) {
      qb.andWhere("DATE(c.createdAt) <= :createdTo", { createdTo });
    }

    // مرتب‌سازی امن بر اساس allowlist
    const sortColumnMap: Record<string, string> = {
      createdAt: "c.createdAt",
      updatedAt: "c.updatedAt",
      name: "c.name",
      slug: "c.slug",
      depth: "c.depth",
    };
    qb.orderBy(
      sortColumnMap[sortBy] ?? "c.createdAt",
      sortDir === "ASC" ? "ASC" : "DESC"
    );

    // صفحه‌بندی
    const take = Math.max(1, Math.min(100, pageSize));
    const skip = Math.max(0, (Math.max(1, page) - 1) * take);

    qb.take(take).skip(skip);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page: Math.max(1, page),
      pageSize: take,
      pages: Math.ceil(total / take),
    };
  }

  async listCategories() {
    const repo = this.ds.getRepository(ArticleCategory);
    // مرتب‌سازی معنادار: عمق سپس نام
    const list = await repo.find({
      relations: ["parent"],
      order: { depth: "ASC", name: "ASC" },
    });
    return list;
  }

  async getCategoryById(id: string) {
    const repo = this.ds.getRepository(ArticleCategory);
    const cat = await repo.findOne({
      where: { id },
      relations: ["parent", "children"],
    });
    return cat;
  }

  async createCategory(input: {
    name: string;
    slug: string;
    description?: string | null;
    parentId?: string | null;
  }) {
    const repo = this.ds.getRepository(ArticleCategory);

    const slugExists = await repo.exists({
      where: { slug: input.slug.trim().toLowerCase() },
    });
    if (slugExists) throw new Error("این اسلاگ قبلاً استفاده شده است");

    const parent = input.parentId
      ? await repo.findOne({ where: { id: input.parentId } })
      : null;

    const cat = repo.create({
      name: input.name.trim(),
      slug: input.slug.trim().toLowerCase(),
      description: input.description ?? null,
      parent,
      depth: parent ? (parent.depth ?? 0) + 1 : 0,
    });

    const saved = await repo.save(cat);
    return saved;
  }

  async updateCategory(
    id: string,
    updates: {
      name?: string;
      slug?: string;
      description?: string | null;
      parentId?: string | null;
    }
  ) {
    const repo = this.ds.getRepository(ArticleCategory);
    const cat = await repo.findOne({
      where: { id },
      relations: ["parent", "children"],
    });
    if (!cat) throw new Error("Category not found");

    if (updates.slug) {
      const nextSlug = updates.slug.trim().toLowerCase();
      if (nextSlug !== cat.slug) {
        const exists = await repo.exists({ where: { slug: nextSlug } });
        if (exists) throw new Error("این اسلاگ قبلاً استفاده شده است");
        cat.slug = nextSlug;
      }
    }

    if (updates.name !== undefined) cat.name = updates.name.trim();
    if (updates.description !== undefined)
      cat.description = updates.description;

    if (updates.parentId !== undefined) {
      const newParent = updates.parentId
        ? await repo.findOne({
            where: { id: updates.parentId },
            relations: ["parent"],
          })
        : null;

      if (newParent) {
        if (newParent.id === cat.id)
          throw new Error("نمی‌توانید والد را خود دسته قرار دهید");

        const ancestorsOfNewParent = await this.getAncestorsChain(newParent.id);
        if (ancestorsOfNewParent.some((a) => a.id === cat.id)) {
          throw new Error("والد نامعتبر است (ایجاد چرخه)");
        }
      }

      const oldDepth = cat.depth ?? 0;
      const nextDepth = newParent ? (newParent.depth ?? 0) + 1 : 0;
      const delta = nextDepth - oldDepth;

      cat.parent = newParent ?? null;
      cat.depth = nextDepth;

      await this.ds.transaction(async (manager) => {
        await manager.getRepository(ArticleCategory).save(cat);

        const q = await manager.getRepository(ArticleCategory).find({
          where: { parent: { id: cat.id } },
          relations: ["parent"],
        });

        const queue = [...q];
        while (queue.length) {
          const node = queue.shift()!;
          node.depth = (node.depth ?? 0) + delta;
          await manager.getRepository(ArticleCategory).save(node);

          const children = await manager.getRepository(ArticleCategory).find({
            where: { parent: { id: node.id } },
            relations: ["parent"],
          });
          queue.push(...children);
        }
      });
    } else {
      await repo.save(cat);
    }

    const fresh = await repo.findOne({
      where: { id: cat.id },
      relations: ["parent", "children"],
    });
    return fresh!;
  }

  async deleteCategory(id: string) {
    const repo = this.ds.getRepository(ArticleCategory);
    const cat = await repo.findOne({
      where: { id },
      relations: ["children"],
    });
    if (!cat) throw new Error("Category not found");

    if (cat.children?.length) {
      throw new Error("ابتدا زیردسته‌ها را حذف یا جابه‌جا کنید");
    }

    await repo.remove(cat);
    return { ok: true };
  }
}
