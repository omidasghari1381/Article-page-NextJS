import { DataSource, In, Repository } from "typeorm";
import { Article } from "@/server/modules/articles/entities/article.entity";
import { User } from "@/server/modules/users/entities/user.entity";
import { CommentArticle } from "@/server/modules/articles/entities/comment.entity";
import { ReplyComment } from "@/server/modules/articles/entities/reply.entity";
import { ArticleCategory } from "@/server/modules/categories/entities/category.entity";
import { ArticleTag } from "@/server/modules/tags/entities/tage.entity";
import type {
  ArticleDTO,
  CreateArticleInput,
  ExtendedListArticlesQuery,
  ListArticlesQuery,
  ListResult,
  UpdateArticleInput,
} from "../types/service.types";

export class ArticleService {
  private readonly articleRepo: Repository<Article>;
  private readonly userRepo: Repository<User>;
  private readonly commentRepo: Repository<CommentArticle>;
  private readonly replyRepo: Repository<ReplyComment>;
  private readonly categoryRepo: Repository<ArticleCategory>;
  private readonly tagRepo: Repository<ArticleTag>;

  constructor(private readonly ds: DataSource) {
    this.articleRepo = ds.getRepository(Article);
    this.userRepo = ds.getRepository(User);
    this.commentRepo = ds.getRepository(CommentArticle);
    this.replyRepo = ds.getRepository(ReplyComment);
    this.categoryRepo = ds.getRepository(ArticleCategory);
    this.tagRepo = ds.getRepository(ArticleTag);
  }

  private mapArticleToDTO(it: Article): ArticleDTO {
    const author = it.author as unknown as Partial<User> | null | undefined;
    const category = (it as any).category as ArticleCategory | null | undefined;
    const tags = Array.isArray((it as any).tags)
      ? ((it as any).tags as ArticleTag[])
      : [];

    return {
      id: it.id,
      title: it.title,
      slug: it.slug ?? null,
      subject: it.subject ?? null,
      readingPeriod: it.readingPeriod ?? 0,
      viewCount: it.viewCount ?? 0,
      thumbnail: it.thumbnail ?? null,
      introduction: it.introduction ?? null,
      quotes: it.quotes ?? null,
      summery: it.summery ?? null,
      mainText: it.mainText,
      secondaryText: it.secondaryText ?? null,
      author: author
        ? {
            id: String(author.id),
            firstName: String(author.firstName),
            lastName: String(author.lastName),
          }
        : null,
      categories: category
        ? [{ id: category.id, name: category.name, slug: category.slug }]
        : [],
      tags: tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),
      createdAt: it.createdAt!,
      createdAtISO: it.createdAt
        ? new Date(it.createdAt).toISOString()
        : undefined,
    };
  }

  private mapToLite(it: Article) {
    const dto = this.mapArticleToDTO(it);
    const category = dto.categories[0] ?? null;

    return {
      id: dto.id,
      title: dto.title,
      subject: dto.subject,
      createdAt: dto.createdAtISO ?? (dto.createdAt as any),
      category: category ? { id: category.id, name: category.name } : null,
      author: dto.author
        ? {
            id: dto.author.id,
            firstName: dto.author.firstName,
            lastName: dto.author.lastName,
          }
        : null,
      thumbnail: dto.thumbnail,
      readingPeriod: dto.readingPeriod,
    };
  }

  async getByIdAndIncrementView(id: string): Promise<ArticleDTO | null> {
    const item = await this.articleRepo.findOne({
      where: { id },
      relations: ["author", "category", "tags"],
    });
    if (!item) return null;

    await this.articleRepo.increment({ id }, "viewCount", 1);
    item.viewCount = (item.viewCount ?? 0) + 1;

    return this.mapArticleToDTO(item);
  }

  async getBySlug(slug: string): Promise<ArticleDTO | null> {
    const item = await this.articleRepo.findOne({
      where: { slug },
      relations: ["author", "category", "tags"],
    });
    return item ? this.mapArticleToDTO(item) : null;
  }

  async create(
    input: CreateArticleInput,
    authorId: string
  ): Promise<{ id: string }> {
    if (!input.categoryId) throw new Error("CategoryRequired");

    const [author, category, tags] = await Promise.all([
      this.userRepo.findOne({ where: { id: authorId } }),
      this.categoryRepo.findOne({ where: { id: input.categoryId } }),
      input.tagIds?.length
        ? this.tagRepo.findBy({ id: In(input.tagIds) })
        : Promise.resolve([]),
    ]);

    if (!author) throw new Error("AuthorNotFound");
    if (!category) throw new Error("CategoryNotFound");
    if (input.tagIds?.length && tags.length !== input.tagIds.length)
      throw new Error("SomeTagIdsNotFound");

    const article = this.articleRepo.create({
      title: input.title.trim(),
      slug: input.slug ?? null,
      subject: input.subject ?? null,
      author,
      mainText: input.mainText,
      secondaryText: input.secondaryText ?? null,
      introduction: input.introduction ?? null,
      quotes: input.quotes ?? null,
      category,
      tags,
      thumbnail: input.thumbnail?.trim() || null,
      readingPeriod: Number(input.readingPeriod ?? 0) || 0,
      summery: Array.isArray(input.summery) ? input.summery : null,
    });

    const saved = await this.articleRepo.save(article);
    return { id: saved.id };
  }

  async update(id: string, input: UpdateArticleInput): Promise<ArticleDTO> {
    const article = await this.articleRepo.findOne({
      where: { id },
      relations: ["category", "tags", "author"],
    });
    if (!article) throw new Error("ArticleNotFound");

    if (typeof input.title === "string") article.title = input.title.trim();
    if (typeof input.slug !== "undefined") article.slug = input.slug ?? null;
    if (typeof input.subject !== "undefined")
      article.subject = input.subject ?? null;
    if (typeof input.mainText === "string") article.mainText = input.mainText;
    if (typeof input.secondaryText !== "undefined")
      article.secondaryText = input.secondaryText ?? null;
    if (typeof input.introduction !== "undefined")
      article.introduction = input.introduction ?? null;
    if (typeof input.quotes !== "undefined")
      article.quotes = input.quotes ?? null;
    if (typeof input.readingPeriod !== "undefined")
      article.readingPeriod = Number(input.readingPeriod ?? 0) || 0;
    if (typeof input.summery !== "undefined")
      article.summery = Array.isArray(input.summery) ? input.summery : null;

    if (typeof input.thumbnail !== "undefined") {
      article.thumbnail = input.thumbnail?.trim() || null;
    }

    if (typeof input.categoryId !== "undefined") {
      if (!input.categoryId) throw new Error("CategoryRequired");
      const cat = await this.categoryRepo.findOne({
        where: { id: input.categoryId },
      });
      if (!cat) throw new Error("CategoryNotFound");
      (article as any).category = cat;
    }

    if (input.tagIds) {
      if (input.tagIds.length === 0) {
        article.tags = [];
      } else {
        const tgs = await this.tagRepo.findBy({ id: In(input.tagIds) });
        if (tgs.length !== input.tagIds.length)
          throw new Error("SomeTagIdsNotFound");
        article.tags = tgs;
      }
    }

    const saved = await this.articleRepo.save(article);
    return this.mapArticleToDTO(saved);
  }

  async list(query: ListArticlesQuery): Promise<ListResult<ArticleDTO>> {
    const page = Math.max(1, query.page ?? 1);
    const perPage = Math.max(1, Math.min(100, query.perPage ?? 10));
    const skip = (page - 1) * perPage;

    const qb = this.articleRepo
      .createQueryBuilder("a")
      .leftJoinAndSelect("a.author", "author")
      .leftJoinAndSelect("a.category", "cat")
      .leftJoinAndSelect("a.tags", "tag");

    if (query.categoryId)
      qb.andWhere("cat.id = :cid", { cid: query.categoryId });
    if (query.tagId) qb.andWhere("tag.id = :tid", { tid: query.tagId });
    if (query.q) qb.andWhere("a.title LIKE :q", { q: `%${query.q}%` });

    qb.orderBy("a.createdAt", "DESC").skip(skip).take(perPage);

    const [items, total] = await qb.getManyAndCount();
    return {
      page,
      perPage,
      total,
      items: items.map((it) => this.mapArticleToDTO(it)),
    };
  }

  async listWithFilters(
    query: ExtendedListArticlesQuery
  ): Promise<ListResult<ArticleDTO>> {
    const page = Math.max(1, query.page ?? 1);
    const perPage = Math.max(
      1,
      Math.min(100, query.pageSize ?? query.perPage ?? 20)
    );
    const skip = (page - 1) * perPage;

    const qb = this.articleRepo
      .createQueryBuilder("a")
      .leftJoinAndSelect("a.author", "author")
      .leftJoinAndSelect("a.category", "cat")
      .leftJoinAndSelect("a.tags", "tag");

    if (query.categoryId)
      qb.andWhere("cat.id = :cid", { cid: query.categoryId });
    if (query.tagId) qb.andWhere("tag.id = :tid", { tid: query.tagId });
    if (query.authorId)
      qb.andWhere("author.id = :aid", { aid: query.authorId });

    if (query.q) {
      qb.andWhere(
        `(a.title LIKE :q OR a.subject LIKE :q OR a.slug LIKE :q OR a.introduction LIKE :q)`,
        { q: `%${query.q}%` }
      );
    }

    if (query.createdFrom) {
      qb.andWhere("a.createdAt >= :from", {
        from: new Date(`${query.createdFrom}T00:00:00.000Z`),
      });
    }
    if (query.createdTo) {
      qb.andWhere("a.createdAt <= :to", {
        to: new Date(`${query.createdTo}T23:59:59.999Z`),
      });
    }

    const sortBy = query.sortBy ?? "createdAt";
    const sortDir = (query.sortDir ?? "DESC") === "ASC" ? "ASC" : "DESC";
    const sortMap: Record<
      NonNullable<ExtendedListArticlesQuery["sortBy"]>,
      string
    > = {
      createdAt: "a.createdAt",
      updatedAt: "a.updatedAt",
      viewCount: "a.viewCount",
      readingPeriod: "a.readingPeriod",
      title: "a.title",
      slug: "a.slug",
    };

    qb.orderBy(sortMap[sortBy], sortDir).skip(skip).take(perPage);

    const [items, total] = await qb.getManyAndCount();
    return {
      page,
      perPage,
      total,
      items: items.map((it) => this.mapArticleToDTO(it)),
    };
  }

  async listLite(query: ExtendedListArticlesQuery) {
    const res = await this.listWithFilters(query);
    return {
      ...res,
      items: res.items.map((it) => this.mapToLite(it as any)),
    };
  }

  async delete(id: string): Promise<boolean> {
    const found = await this.articleRepo.findOne({ where: { id } });
    if (!found) return false;
    await this.articleRepo.remove(found);
    return true;
  }

  async listComments(
    articleId: string,
    opts?: { skip?: number; take?: number; withReplies?: boolean }
  ) {
    const skip = Math.max(0, opts?.skip ?? 0);
    const take = Math.min(Math.max(1, opts?.take ?? 10), 50);
    const withReplies = !!opts?.withReplies;

    const exists = await this.articleRepo.exist({ where: { id: articleId } });
    if (!exists) throw new Error("ArticleNotFound");

    const [comments, total] = await this.commentRepo.findAndCount({
      where: { article: { id: articleId } },
      relations: ["user"],
      order: { createdAt: "DESC" },
      skip,
      take,
    });

    if (!withReplies || comments.length === 0) {
      return { data: comments, total, skip, take };
    }

    const ids = comments.map((c) => c.id);
    const replies = await this.replyRepo
      .createQueryBuilder("reply")
      .leftJoinAndSelect("reply.user", "user")
      .leftJoinAndSelect("reply.comment", "comment")
      .where("comment.id IN (:...ids)", { ids })
      .orderBy("reply.createdAt", "ASC")
      .getMany();

    const grouped = replies.reduce<Record<string, ReplyComment[]>>((acc, r) => {
      const cid = (r.comment as any).id as string;
      (acc[cid] ??= []).push(r);
      return acc;
    }, {});

    const payload = comments.map((c) => ({
      ...c,
      replies: grouped[c.id] ?? [],
    }));

    return { data: payload, total, skip, take };
  }

  async addComment(articleId: string, userId: string, text: string) {
    const [article, user] = await Promise.all([
      this.articleRepo.findOne({ where: { id: articleId } }),
      this.userRepo.findOne({ where: { id: userId } }),
    ]);

    if (!article) throw new Error("ArticleNotFound");
    if (!user) throw new Error("UserNotFound");

    const comment = this.commentRepo.create({
      text: text.trim(),
      user,
      article,
    });

    const saved = await this.commentRepo.save(comment);
    const withUser = await this.commentRepo.findOne({
      where: { id: saved.id },
      relations: ["user"],
    });

    return withUser!;
  }
}
