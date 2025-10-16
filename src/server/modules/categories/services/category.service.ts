import { DataSource, Repository } from "typeorm";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { ArticleCategory } from "../entities/category.entity";
import type { CategoryListFilters } from "../types/service.type";
import { escapeLike } from "@/server/core/utils/escapeLike";

export type CategoryDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  depth: number;
  parent?: { id: string; name: string } | null;
  children?: { id: string; name: string }[] | null;
};

export class CategoryService {
  private repoP: Promise<Repository<ArticleCategory>>;

  constructor() {
    this.repoP = getDataSource().then((ds: DataSource) =>
      ds.getRepository(ArticleCategory)
    );
  }

  private async repo() {
    return this.repoP;
  }

  private toDTO(
    c: ArticleCategory,
    opts?: { withChildren?: boolean }
  ): CategoryDTO {
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description ?? null,
      depth: c.depth ?? 0,
      parent: c.parent ? { id: c.parent.id, name: c.parent.name } : null,
      children: opts?.withChildren
        ? (c.children ?? [])?.map((ch) => ({ id: ch.id, name: ch.name }))
        : undefined,
    };
  }

  private async getAncestorsChain(catId: string): Promise<ArticleCategory[]> {
    const repo = await this.repo();
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

    const repo = await this.repo();
    const qb = repo.createQueryBuilder("c").leftJoinAndSelect("c.parent", "p");

    if (q?.trim()) {
      const like = `%${escapeLike(q.trim())}%`;
      qb.andWhere(
        "(c.name LIKE :q ESCAPE '\\' OR c.slug LIKE :q ESCAPE '\\' OR c.description LIKE :q ESCAPE '\\')",
        { q: like }
      );
    }
    if (parentId) qb.andWhere("p.id = :parentId", { parentId });
    if (hasParent === "yes") qb.andWhere("c.parentId IS NOT NULL");
    else if (hasParent === "no") qb.andWhere("c.parentId IS NULL");
    if (typeof depthMin === "number")
      qb.andWhere("c.depth >= :depthMin", { depthMin });
    if (typeof depthMax === "number")
      qb.andWhere("c.depth <= :depthMax", { depthMax });
    if (createdFrom)
      qb.andWhere("DATE(c.createdAt) >= :createdFrom", { createdFrom });
    if (createdTo)
      qb.andWhere("DATE(c.createdAt) <= :createdTo", { createdTo });

    const sortMap: Record<string, string> = {
      createdAt: "c.createdAt",
      updatedAt: "c.updatedAt",
      name: "c.name",
      slug: "c.slug",
      depth: "c.depth",
    };
    qb.orderBy(
      sortMap[sortBy] ?? "c.createdAt",
      sortDir === "ASC" ? "ASC" : "DESC"
    );

    const take = Math.max(1, Math.min(100, pageSize));
    const skip = Math.max(0, (Math.max(1, page) - 1) * take);
    qb.take(take).skip(skip);

    const [rows, total] = await qb.getManyAndCount();
    return {
      items: rows.map((r) => this.toDTO(r)),
      total,
      page: Math.max(1, page),
      pageSize: take,
      pages: Math.ceil(total / take),
    };
  }

  async listCategories() {
    const repo = await this.repo();
    const rows = await repo.find({
      relations: ["parent"],
      order: { depth: "ASC", name: "ASC" },
    });
    return rows.map((r) => this.toDTO(r));
  }

  async getCategoryById(id: string) {
    const repo = await this.repo();
    const ent = await repo.findOne({
      where: { id },
      relations: ["parent", "children"],
    });
    return ent ? this.toDTO(ent, { withChildren: true }) : null;
  }

  async createCategory(input: {
    name: string;
    slug: string;
    description?: string | null;
    parentId?: string | null;
  }) {
    const repo = await this.repo();

    const slug = input.slug.trim().toLowerCase();
    const exists = await repo.exists({ where: { slug } });
    if (exists) throw new Error("این اسلاگ قبلاً استفاده شده است");

    const parent = input.parentId
      ? await repo.findOne({ where: { id: input.parentId } })
      : null;
    const cat = repo.create({
      name: input.name.trim(),
      slug,
      description: input.description ?? null,
      parent,
      depth: parent ? (parent.depth ?? 0) + 1 : 0,
    });

    const saved = await repo.save(cat);
    const withRels = await repo.findOne({
      where: { id: saved.id },
      relations: ["parent"],
    });
    return this.toDTO(withRels!);
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
    const repo = await this.repo();
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
        const ancestors = await this.getAncestorsChain(newParent.id);
        if (ancestors.some((a) => a.id === cat.id))
          throw new Error("والد نامعتبر است (ایجاد چرخه)");
      }

      const oldDepth = cat.depth ?? 0;
      const nextDepth = newParent ? (newParent.depth ?? 0) + 1 : 0;
      const delta = nextDepth - oldDepth;

      cat.parent = newParent ?? null;
      cat.depth = nextDepth;

      await repo.manager.transaction(async (tm) => {
        const mRepo = tm.getRepository(ArticleCategory);
        await mRepo.save(cat);

        const q = await mRepo.find({
          where: { parent: { id: cat.id } },
          relations: ["parent"],
        });
        const queue = [...q];
        while (queue.length) {
          const node = queue.shift()!;
          node.depth = (node.depth ?? 0) + delta;
          await mRepo.save(node);
          const children = await mRepo.find({
            where: { parent: { id: node.id } },
            relations: ["parent"],
          });
          queue.push(...children);
        }
      });
    } else {
      await repo.save(cat);
    }

    const updated = await repo.findOne({
      where: { id: cat.id },
      relations: ["parent", "children"],
    });
    return this.toDTO(updated!, { withChildren: true });
  }

  async deleteCategory(id: string) {
    const repo = await this.repo();
    const cat = await repo.findOne({ where: { id }, relations: ["children"] });
    if (!cat) throw new Error("Category not found");
    if (cat.children?.length)
      throw new Error("ابتدا زیردسته‌ها را حذف یا جابه‌جا کنید");
    await repo.remove(cat);
    return { ok: true };
  }
}
