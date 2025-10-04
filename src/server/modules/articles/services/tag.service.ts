import type { DataSource, Repository } from "typeorm";
import { ArticleTag } from "../entities/articleTages.entity";

// برای خروجی GET /api/tags
export type TagListQuery = { page: number; perPage: number; q?: string };
export type TagListItem = { id: string; name: string; slug: string; description?: string | null };
export type TagListResult = { page: number; perPage: number; total: number; items: TagListItem[] };

export class TagsService {
  private repo: Repository<ArticleTag>;

  constructor(private ds: DataSource) {
    this.repo = this.ds.getRepository(ArticleTag);
  }

  async createTag(input: { name: string; slug: string; description?: string | null }) {
    const name = input.name.trim();
    const slug = input.slug.trim().toLowerCase();
    const description = input.description ?? null;

    // یکتا بودن slug (اگر constraint یونیک داری، این چک برای ارور دوستانه‌تره)
    const exists = await this.repo.exists({ where: { slug } });
    if (exists) {
      const err: any = new Error("DuplicateSlug");
      err.status = 409;
      throw err;
    }

    const tag = this.repo.create({ name, slug, description });
    return await this.repo.save(tag);
  }

  async updateTag(
    id: string,
    updates: { name?: string; slug?: string; description?: string | null }
  ) {
    const tag = await this.repo.findOne({ where: { id } });
    if (!tag) throw new Error("Tag not found"); // ✅ پیام درست

    if (typeof updates.name === "string") tag.name = updates.name.trim();
    if (typeof updates.slug === "string") {
      const nextSlug = updates.slug.trim().toLowerCase();
      if (nextSlug !== tag.slug) {
        const exists = await this.repo.exists({ where: { slug: nextSlug } });
        if (exists) {
          const err: any = new Error("DuplicateSlug");
          err.status = 409;
          throw err;
        }
      }
      tag.slug = nextSlug;
    }
    if (updates.description !== undefined) tag.description = updates.description;

    return await this.repo.save(tag);
  }

  /** سازگاری عقب‌رو: اگر id بدهی، همون یک تگ؛ اگر name بدهی، لیست با where name؛
   * پیشنهاد می‌شود به‌جای این از listTags/getById استفاده کنی.
   */
  async getTags(id?: string, name?: string) {
    if (id) {
      return await this.repo.findOne({ where: { id } });
    }
    if (typeof name === "string") {
      return await this.repo.find({ where: { name } });
    }
    return await this.repo.find();
  }

  /** جدید: دریافت یک تگ */
  async getById(id: string) {
    const tag = await this.repo.findOne({ where: { id } });
    if (!tag) throw new Error("Tag not found");
    return tag;
  }

  /** جدید: لیست با صفحه‌بندی و جستجو (برای GET /api/tags) */
  async listTags(query: TagListQuery): Promise<TagListResult> {
    const page = Math.max(1, query.page ?? 1);
    const perPage = Math.max(1, Math.min(100, query.perPage ?? 20));
    const skip = (page - 1) * perPage;

    const qb = this.repo.createQueryBuilder("tag");

    if (query.q && query.q.trim()) {
      const q = query.q.trim().toLowerCase();
      qb.where("LOWER(tag.name) LIKE :q OR LOWER(tag.slug) LIKE :q", { q: `%${q}%` });
    }

    qb.orderBy("tag.createdAt", "DESC").skip(skip).take(perPage);

    const [rows, total] = await qb.getManyAndCount();
    const items: TagListItem[] = rows.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description ?? null,
    }));

    return { page, perPage, total, items };
  }

  async deleteTag(id: string) {
    try {
      // می‌تونی قبل از حذف، اتصال به مقاله‌ها را چک کنی (اختیاری)
      // اگر جدول join را خودت ساختی و FK RESTRICT داری، این چک صرفاً برای پیام بهتر است.
      // مثال خام: اگر نام جدول join "article_tags" است:
      // const raw = await this.ds.query(
      //   'SELECT COUNT(*)::int AS c FROM "article_tags" WHERE "tag_id" = $1',
      //   [id]
      // );
      // if ((raw?.[0]?.c ?? 0) > 0) {
      //   const err: any = new Error("TagHasArticles");
      //   err.status = 409;
      //   throw err;
      // }

      const effect = await this.repo.delete(id);
      return effect;
    } catch (err: any) {
      // تبدیل خطای FK (Postgres 23503 / MySQL ER_ROW_IS_REFERENCED_2) به پیام دوستانه
      const msg = String(err?.message || "");
      const code = String((err && (err.code || err.errno)) ?? "");
      if (code === "23503" || code === "ER_ROW_IS_REFERENCED_2" || /foreign key/i.test(msg)) {
        const e: any = new Error("TagHasArticles");
        e.status = 409;
        throw e;
      }
      throw err;
    }
  }
}
