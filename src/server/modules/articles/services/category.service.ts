import { DataSource } from "typeorm";
import { ArticleCategory } from "../entities/articleCategory.entity";

export class CategoryService {
  constructor(private ds: DataSource) {}

  /** پیدا کردن مسیر اجداد برای جلوگیری از حلقه و محاسبه depth */
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

  /** ایجاد دسته جدید */
  async createCategory(input: {
    name: string;
    slug: string;
    description?: string | null;
    parentId?: string | null;
  }) {
    const repo = this.ds.getRepository(ArticleCategory);

    const parent = input.parentId
      ? await repo.findOne({ where: { id: input.parentId } })
      : null;

    const cat = repo.create({
      name: input.name.trim(),
      slug: input.slug.trim().toLowerCase(), // نرمال‌سازی اسلاگ
      description: input.description ?? null,
      parent,
      depth: parent ? (parent.depth ?? 0) + 1 : 0,
    });

    return await repo.save(cat);
  }

  /** تغییر والد/به‌روزرسانی اطلاعات دسته */
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
    const cat = await repo.findOne({ where: { id }, relations: ["parent", "children"] });
    if (!cat) throw new Error("Category not found");

    if (updates.name !== undefined) cat.name = updates.name.trim();
    if (updates.slug !== undefined) cat.slug = updates.slug.trim().toLowerCase();
    if (updates.description !== undefined) cat.description = updates.description;

    // تغییر والد
    if (updates.parentId !== undefined) {
      const newParent = updates.parentId
        ? await repo.findOne({ where: { id: updates.parentId } })
        : null;

      // جلوگیری از حلقه: newParent نباید خود cat یا فرزندِ cat باشد
      if (newParent) {
        if (newParent.id === cat.id) throw new Error("A category cannot be its own parent");

        // تمام اجداد newParent را بیاور؛ اگر cat در بین اجداد بود یعنی حلقه می‌شود
        const ancestorsOfNewParent = await this.getAncestorsChain(newParent.id);
        if (ancestorsOfNewParent.some((a) => a.id === cat.id)) {
          throw new Error("Invalid parent: would create a cycle");
        }
      }

      cat.parent = newParent ?? null;
      cat.depth = newParent ? (newParent.depth ?? 0) + 1 : 0;

      // اگر لازم شد: به‌روزرسانی عمق برای همهٔ نوه‌ها (آبشاری)
      // این قسمت می‌تواند با یک کوئری بازگشتی (CTE) یا حلقهٔ برنامه‌ای انجام شود.
      // برای سادگی، اینجا از الگوریتم برنامه‌ای استفاده می‌کنیم:
      const queue = [...(cat.children ?? [])];
      while (queue.length) {
        const child = queue.shift()!;
        child.depth = (child.parent?.depth ?? 0) + 1;
        await repo.save(child);
        const fullChild = await repo.findOne({ where: { id: child.id }, relations: ["children", "parent"] });
        if (fullChild?.children) queue.push(...fullChild.children);
      }
    }

    return await repo.save(cat);
  }
}
