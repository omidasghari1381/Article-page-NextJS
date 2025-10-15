import { In, Repository } from "typeorm";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { Article } from "@/server/modules/articles/entities/article.entity";
import { User } from "@/server/modules/users/entities/user.entity";
import { CommentArticle } from "@/server/modules/articles/entities/comment.entity";
import { ReplyComment } from "@/server/modules/articles/entities/reply.entity";
import { ArticleCategory } from "@/server/modules/categories/entities/category.entity";
import { ArticleTag } from "@/server/modules/tags/entities/tage.entity";
import type {
  ArticleDTO,
  CreateArticleInput,
  UpdateArticleInput,
} from "../types/service.types";

export type Sortable =
  | "createdAt"
  | "updatedAt"
  | "viewCount"
  | "readingPeriod"
  | "title"
  | "slug";
export type SortDir = "ASC" | "DESC";
export type Variant = "full" | "lite";

export type ListFilters = {
  categoryId?: string;
  tagId?: string;
  authorId?: string;
  q?: string;
  createdFrom?: string;
  createdTo?: string;
};

export type ListOptions = {
  page?: number;
  pageSize?: number;
  sort?: { by?: Sortable; dir?: SortDir };
  filters?: ListFilters;
  variant?: Variant;
};

export type ListResultGeneric<T> = {
  page: number;
  perPage: number;
  total: number;
  items: T[];
};

type UserLiteDTO = { id: string; firstName: string; lastName: string };

type ReplyDTO = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: UserLiteDTO;
};

type CommentDTO = {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  user: UserLiteDTO;
  like: number;
  dislike: number;
  replies?: ReplyDTO[];
};

type LiteArticleDTO = {
  id: string;
  title: string;
  createdAt: string;
  categories: string | null;
  author: UserLiteDTO | null;
  thumbnail: string | null;
  readingPeriod: number;
  viewCount: number;
  subject: string | null;
};

export class ArticleService {
  private initP: Promise<void> | null = null;
  private articleRepo!: Repository<Article>;
  private userRepo!: Repository<User>;
  private commentRepo!: Repository<CommentArticle>;
  private replyRepo!: Repository<ReplyComment>;
  private categoryRepo!: Repository<ArticleCategory>;
  private tagRepo!: Repository<ArticleTag>;
  constructor() {
    this.initP = this.initRepos();
  }
  private async initRepos() {
    const ds = await getDataSource();
    this.articleRepo = ds.getRepository(Article);
    this.userRepo = ds.getRepository(User);
    this.commentRepo = ds.getRepository(CommentArticle);
    this.replyRepo = ds.getRepository(ReplyComment);
    this.categoryRepo = ds.getRepository(ArticleCategory);
    this.tagRepo = ds.getRepository(ArticleTag);
  }
  private async ensureInit() {
    if (!this.initP) this.initP = this.initRepos();
    await this.initP;
  }

  private mapArticleToDTO(it: Article): ArticleDTO {
    const author = it.author as unknown as Partial<User> | null | undefined;
    const category = (it as any).category as ArticleCategory | null | undefined;
    const tags = Array.isArray((it as any).tags)
      ? ((it as any).tags as ArticleTag[])
      : [];
    const createdAtISO = it.createdAt
      ? new Date(it.createdAt).toISOString()
      : undefined;
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
      createdAt: createdAtISO ?? "",
      createdAtISO: it.createdAt
        ? new Date(it.createdAt).toISOString()
        : undefined,
    };
  }

  private mapLiteArticleDTO(it: Article): LiteArticleDTO {
    const dto = this.mapArticleToDTO(it);
    const category = dto.categories[0] ?? null;
    return {
      id: dto.id,
      title: dto.title,
      subject: dto.subject,
      createdAt: dto.createdAt,
      categories: category ? category.name : null,
      author: dto.author
        ? {
            id: dto.author.id,
            firstName: dto.author.firstName,
            lastName: dto.author.lastName,
          }
        : null,
      thumbnail: dto.thumbnail,
      readingPeriod: dto.readingPeriod,
      viewCount: dto.viewCount,
    };
  }

  private mapUserLite(u: any): UserLiteDTO {
    return {
      id: String(u?.id ?? ""),
      firstName: String(u?.firstName ?? ""),
      lastName: String(u?.lastName ?? ""),
    };
  }

  private mapReplyDTO(r: ReplyComment): ReplyDTO {
    return {
      id: r.id,
      text: r.text,
      createdAt: r.createdAt
        ? new Date((r as any).createdAt).toISOString()
        : "",
      updatedAt: r.updatedAt
        ? new Date((r as any).updatedAt).toISOString()
        : "",
      user: this.mapUserLite((r as any).user),
    };
  }

  private mapCommentDTO(
    c: CommentArticle,
    replies?: ReplyComment[]
  ): CommentDTO {
    return {
      id: c.id,
      text: c.text,
      createdAt: c.createdAt
        ? new Date((c as any).createdAt).toISOString()
        : "",
      updatedAt: c.updatedAt
        ? new Date((c as any).updatedAt).toISOString()
        : "",
      user: this.mapUserLite((c as any).user),
      like: Number((c as any).like ?? 0),
      dislike: Number((c as any).dislike ?? 0),
      replies: replies?.map((r) => this.mapReplyDTO(r)),
    };
  }

  private buildListQB(opts: ListOptions) {
    const variant: Variant = opts.variant ?? "full";
    const qb = this.articleRepo.createQueryBuilder("a");
    if (variant === "full") {
      qb.leftJoinAndSelect("a.author", "author")
        .leftJoinAndSelect("a.category", "cat")
        .leftJoinAndSelect("a.tags", "tag");
    } else {
      qb.leftJoinAndSelect("a.category", "cat");
      qb.leftJoinAndSelect("a.author", "author");
    }
    const f = opts.filters ?? {};
    if (f.categoryId) qb.andWhere("cat.id = :cid", { cid: f.categoryId });
    if (f.tagId) qb.andWhere("tag.id = :tid", { tid: f.tagId });
    if (f.authorId) qb.andWhere("author.id = :aid", { aid: f.authorId });
    if (f.q) {
      qb.andWhere(
        "(a.title LIKE :q OR a.subject LIKE :q OR a.slug LIKE :q OR a.introduction LIKE :q)",
        { q: `%${f.q}%` }
      );
    }
    if (f.createdFrom)
      qb.andWhere("a.createdAt >= :from", {
        from: new Date(`${f.createdFrom}T00:00:00.000Z`),
      });
    if (f.createdTo)
      qb.andWhere("a.createdAt <= :to", {
        to: new Date(`${f.createdTo}T23:59:59.999Z`),
      });
    const sortBy: Sortable = opts.sort?.by ?? "createdAt";
    const dir: SortDir = (opts.sort?.dir ?? "DESC") === "ASC" ? "ASC" : "DESC";
    const sortMap: Record<Sortable, string> = {
      createdAt: "a.createdAt",
      updatedAt: "a.updatedAt",
      viewCount: "a.viewCount",
      readingPeriod: "a.readingPeriod",
      title: "a.title",
      slug: "a.slug",
    };
    qb.orderBy(sortMap[sortBy], dir);
    return qb;
  }

  async listArticles(
    options?: Omit<ListOptions, "variant"> & { variant?: "full" }
  ): Promise<ListResultGeneric<ArticleDTO>>;
  async listArticles(
    options: Omit<ListOptions, "variant"> & { variant: "lite" }
  ): Promise<
    ListResultGeneric<ReturnType<ArticleService["mapLiteArticleDTO"]>>
  >;
  async listArticles(
    options: ListOptions = {}
  ): Promise<
    ListResultGeneric<
      ArticleDTO | ReturnType<ArticleService["mapLiteArticleDTO"]>
    >
  > {
    await this.ensureInit();
    const page = Math.max(1, options.page ?? 1);
    const perPage = Math.max(1, Math.min(100, options.pageSize ?? 20));
    const qb = this.buildListQB(options)
      .skip((page - 1) * perPage)
      .take(perPage);
    const [items, total] = await qb.getManyAndCount();
    const variant: Variant = options.variant ?? "full";
    const mapped =
      variant === "lite"
        ? items.map((it) => this.mapLiteArticleDTO(it))
        : items.map((it) => this.mapArticleToDTO(it));
    return { page, perPage, total, items: mapped as any };
  }

  async getById(id: string): Promise<ArticleDTO | null> {
    await this.ensureInit();
    const item = await this.articleRepo.findOne({
      where: { id },
      relations: ["author", "category", "tags"],
    });
    return item ? this.mapArticleToDTO(item) : null;
  }

  async create(
    input: CreateArticleInput,
    authorId: string
  ): Promise<{ id: string }> {
    await this.ensureInit();
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
    await this.ensureInit();
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
    if (typeof input.thumbnail !== "undefined")
      article.thumbnail = input.thumbnail?.trim() || null;
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

  async delete(id: string): Promise<boolean> {
    await this.ensureInit();
    const found = await this.articleRepo.findOne({ where: { id } });
    if (!found) return false;
    await this.articleRepo.remove(found);
    return true;
  }

  async listComments(
    articleId: string,
    opts?: { skip?: number; take?: number; withReplies?: boolean }
  ) {
    await this.ensureInit();
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
      return {
        data: comments.map((c) => this.mapCommentDTO(c)),
        total,
        skip,
        take,
      };
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
    const payload = comments.map((c) =>
      this.mapCommentDTO(c, grouped[c.id] ?? [])
    );
    return { data: payload, total, skip, take };
  }

  async addComment(articleId: string, userId: string, text: string) {
    await this.ensureInit();
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
    return this.mapCommentDTO(withUser!);
  }

  async getViewCount(): Promise<number> {
    await this.ensureInit();
    const row = await this.articleRepo
      .createQueryBuilder("a")
      .select("COALESCE(SUM(a.viewCount), 0)", "total")
      .getRawOne<{ total: string | number }>();
    return Number(row?.total ?? 0);
  }
}
