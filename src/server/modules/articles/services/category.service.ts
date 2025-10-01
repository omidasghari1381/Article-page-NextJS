// src/server/modules/categories/CategoryService.ts
import { DataSource } from "typeorm";
import { ArticleCategory } from "../entities/articleCategory.entity";
import z from "zod";




export class CategoryService {
  constructor(private ds: DataSource) {}

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

    const slugExists = await repo.exists({ where: { slug: input.slug.trim().toLowerCase() } });
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
    if (updates.description !== undefined) cat.description = updates.description;

    if (updates.parentId !== undefined) {
      const newParent = updates.parentId
        ? await repo.findOne({ where: { id: updates.parentId }, relations: ["parent"] })
        : null;

      if (newParent) {
        if (newParent.id === cat.id) throw new Error("نمی‌توانید والد را خود دسته قرار دهید");

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
