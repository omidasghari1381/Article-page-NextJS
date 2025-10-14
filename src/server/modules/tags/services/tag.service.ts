import { Repository } from "typeorm";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { ArticleTag } from "../entities/tage.entity";
import { Article } from "@/server/modules/articles/entities/article.entity";

export type TagListQuery = {
  q?: string;
  page?: number;
  perPage?: number;
  sortBy?: "createdAt" | "updatedAt" | "name" | "slug";
  sortDir?: "ASC" | "DESC";
};

export type TagListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TagListResult = {
  items: TagListItem[];
  total: number;
  page: number;
  perPage: number;
};

type Repos = {
  tagRepo: Repository<ArticleTag>;
  articleRepo: Repository<Article>;
};

const SORTABLE: Record<NonNullable<TagListQuery["sortBy"]>, string> = {
  createdAt: "tag.createdAt",
  updatedAt: "tag.updatedAt",
  name: "tag.name",
  slug: "tag.slug",
};

export class TagsService {
  private reposP: Promise<Repos>;

  constructor() {
    this.reposP = (async () => {
      const ds = await getDataSource();
      return {
        tagRepo: ds.getRepository(ArticleTag),
        articleRepo: ds.getRepository(Article),
      };
    })();
  }
  private async repos() {
    return this.reposP;
  }

  async createTag(input: {
    name: string;
    slug: string;
    description?: string | null;
  }) {
    const { tagRepo } = await this.repos();

    const name = input.name.trim();
    const slug = input.slug.trim().toLowerCase();
    const description = input.description ?? null;

    const exists = await tagRepo.exists({ where: { slug } });
    if (exists) {
      const err: any = new Error("DuplicateSlug");
      err.status = 409;
      throw err;
    }

    const tag = tagRepo.create({ name, slug, description });
    return await tagRepo.save(tag);
  }

  async updateTag(
    id: string,
    updates: { name?: string; slug?: string; description?: string | null }
  ) {
    const { tagRepo } = await this.repos();

    const tag = await tagRepo.findOne({ where: { id } });
    if (!tag) throw new Error("Tag not found");

    if (typeof updates.name === "string") tag.name = updates.name.trim();

    if (typeof updates.slug === "string") {
      const nextSlug = updates.slug.trim().toLowerCase();
      if (nextSlug !== tag.slug) {
        const exists = await tagRepo.exists({ where: { slug: nextSlug } });
        if (exists) {
          const err: any = new Error("DuplicateSlug");
          err.status = 409;
          throw err;
        }
      }
      tag.slug = nextSlug;
    }

    if (updates.description !== undefined)
      tag.description = updates.description;

    return await tagRepo.save(tag);
  }

  async getTags(id?: string, name?: string) {
    const { tagRepo } = await this.repos();
    if (id) return await tagRepo.findOne({ where: { id } });
    if (typeof name === "string")
      return await tagRepo.find({ where: { name } });
    return await tagRepo.find();
  }

  async getById(id: string) {
    const { tagRepo } = await this.repos();
    const tag = await tagRepo.findOne({ where: { id } });
    if (!tag) throw new Error("Tag not found");
    return tag;
  }

  async listTags(query: TagListQuery): Promise<TagListResult> {
    const { tagRepo } = await this.repos();

    const page = Math.max(1, query.page ?? 1);
    const perPage = Math.max(1, Math.min(100, query.perPage ?? 20));
    const skip = (page - 1) * perPage;

    const qb = tagRepo.createQueryBuilder("tag");

    if (query.q && query.q.trim()) {
      const q = query.q.trim().toLowerCase();
      qb.where("LOWER(tag.name) LIKE :q OR LOWER(tag.slug) LIKE :q", {
        q: `%${q}%`,
      });
    }

    // مرتب‌سازی امن (ستون‌های سفیدلیست‌شده)
    const sortBy =
      query.sortBy && SORTABLE[query.sortBy]
        ? SORTABLE[query.sortBy]
        : SORTABLE.createdAt;
    const sortDir = query.sortDir === "ASC" ? "ASC" : "DESC";
    qb.orderBy(sortBy, sortDir as "ASC" | "DESC")
      .addOrderBy("tag.id", "DESC") // برای پایداری
      .skip(skip)
      .take(perPage);

    const [rows, total] = await qb.getManyAndCount();

    const items: TagListItem[] = rows.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      description: t.description ?? null,
      createdAt: t.createdAt!,
      updatedAt: t.updatedAt!,
    }));

    return { page, perPage, total, items };
  }

  async deleteTag(id: string) {
    const { tagRepo, articleRepo } = await this.repos();

    const relatedCount = await articleRepo
      .createQueryBuilder("a")
      .innerJoin("a.tags", "t", "t.id = :id", { id })
      .getCount();

    if (relatedCount > 0) {
      const err: any = new Error("TagHasArticles");
      err.status = 409;
      throw err;
    }

    try {
      const effect = await tagRepo.delete(id);
      return effect;
    } catch (err: any) {
      const msg = String(err?.message || "");
      const code = String((err && (err.code || err.errno)) ?? "");
      if (
        code === "23503" ||
        code === "ER_ROW_IS_REFERENCED_2" ||
        /foreign key/i.test(msg)
      ) {
        const e: any = new Error("TagHasArticles");
        e.status = 409;
        throw e;
      }
      throw err;
    }
  }
}
