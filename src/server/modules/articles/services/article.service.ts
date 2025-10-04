import { DataSource, In, Repository } from "typeorm";
import { Article } from "@/server/modules/articles/entities/article.entity";
import { User } from "@/server/modules/users/entities/user.entity";
import { CommentArticle } from "@/server/modules/articles/entities/comment.entity";
import { ReplyComment } from "@/server/modules/articles/entities/reply.entity";
import { ArticleCategory } from "@/server/modules/articles/entities/articleCategory.entity";
import { ArticleTag } from "../entities/articleTages.entity";

/** ---------- Types ---------- */

export type CreateArticleInput = {
  title: string;
  subject?: string | null;
  mainText: string;
  secondaryText?: string | null;
  introduction?: string | null;
  quotes?: string | null;

  /** روابط */
  categoryId: string;        // ✅ الزامی و تک‌انتخابی
  tagIds?: string[];         // اختیاری (چندتایی)

  /** سایر */
  readingPeriod: number;     // دقیقه (الزامی)
  summary?: string[] | null;
  slug?: string | null;

  /** Thumbnail: فقط URL */
  thumbnail?: string | null; // ✅ URL یا null
};

export type UpdateArticleInput = Partial<CreateArticleInput>;

export type ListArticlesQuery = {
  page?: number;
  perPage?: number;
  categoryId?: string;
  tagId?: string;
  q?: string;
};

export type ListResult<T> = {
  page: number;
  perPage: number;
  total: number;
  items: T[];
};

export type ArticleDTO = {
  id: string;
  title: string;
  slug: string | null;
  subject: string | null;

  readingPeriod: number;
  viewCount: number;

  thumbnail: string | null;

  introduction: string | null;
  quotes: string | null;
  summary: string[] | null;

  mainText: string;
  secondaryText: string | null;

  author: { id: string; firstName: string; lastName: string } | null;

  /** برای عدم‌تغییر فرانت، خروجی را آرایهٔ تک‌عضوی نگه می‌داریم */
  categories: { id: string; name: string; slug: string }[];
  tags: { id: string; name: string; slug: string }[];

  createdAt: Date;
};

/** ---------- Service ---------- */

export class ArticleService {
  private articleRepo: Repository<Article>;
  private userRepo: Repository<User>;
  private commentRepo: Repository<CommentArticle>;
  private replyRepo: Repository<ReplyComment>;
  private categoryRepo: Repository<ArticleCategory>;
  private tagRepo: Repository<ArticleTag>;

  constructor(private readonly ds: DataSource) {
    this.articleRepo = ds.getRepository(Article);
    this.userRepo = ds.getRepository(User);
    this.commentRepo = ds.getRepository(CommentArticle);
    this.replyRepo = ds.getRepository(ReplyComment);
    this.categoryRepo = ds.getRepository(ArticleCategory);
    this.tagRepo = ds.getRepository(ArticleTag);
  }

  /** map entity -> DTO */
  private mapArticleToDTO(it: Article): ArticleDTO {
    const author = it.author as unknown as Partial<User> | null | undefined;
    const cat = (it as any).category as ArticleCategory | null | undefined;
    const tags = Array.isArray((it as any).tags) ? ((it as any).tags as ArticleTag[]) : [];

    return {
      id: it.id,
      title: it.title,
      slug: it.slug ?? null,
      subject: it.subject ?? null,

      readingPeriod: it.readingPeriod ?? 0,
      viewCount: it.viewCount ?? 0,

      thumbnail: (it as any).thumbnail ?? null,

      introduction: it.introduction ?? null,
      quotes: it.quotes ?? null,
      summary: it.summary ?? null,

      mainText: it.mainText,
      secondaryText: it.secondaryText ?? null,

      author: author
        ? {
            id: String(author.id),
            firstName: String(author.firstName),
            lastName: String(author.lastName),
          }
        : null,

      // ✅ آرایهٔ تک‌عضوی برای سازگاری UI
      categories: cat ? [{ id: cat.id, name: cat.name, slug: cat.slug }] : [],
      tags: tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug })),

      createdAt: it.createdAt!,
    };
  }

  /** GET /api/articles/[id] + افزایش viewCount (اتُمیک) */
  async getByIdAndIncrementView(id: string): Promise<ArticleDTO | null> {
    const item = await this.articleRepo.findOne({
      where: { id },
      relations: ["author", "category", "tags"], // ✅ category تکی
    });
    if (!item) return null;

    await this.articleRepo.increment({ id }, "viewCount", 1);
    item.viewCount = (item.viewCount ?? 0) + 1;

    return this.mapArticleToDTO(item);
  }

  /** ایجاد مقاله (authorId از روت پاس داده می‌شود) */
  async create(input: CreateArticleInput, authorId: string): Promise<{ id: string }> {
    if (!input.categoryId) throw new Error("CategoryRequired");

  const [author, category, tags] = await Promise.all([
    this.userRepo.findOne({ where: { id: authorId } }),
    this.categoryRepo.findOne({ where: { id: input.categoryId } }),
    input.tagIds?.length ? this.tagRepo.findBy({ id: In(input.tagIds) }) : Promise.resolve([]),
  ]);

    if (!author) throw new Error("AuthorNotFound");
    if (!category) throw new Error("CategoryNotFound");
    if (input.tagIds?.length && tags.length !== input.tagIds.length) {
      throw new Error("SomeTagIdsNotFound");
    }

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

      thumbnail: input.thumbnail?.trim() || null, // ✅ URL

      readingPeriod: Number(input.readingPeriod ?? 0) || 0,
      summary: Array.isArray(input.summary) ? input.summary : null,
    });

    const saved = await this.articleRepo.save(article);
    return { id: saved.id };
  }

  /** به‌روزرسانی مقاله */
  async update(id: string, input: UpdateArticleInput): Promise<ArticleDTO> {
    const article = await this.articleRepo.findOne({
      where: { id },
      relations: ["category", "tags", "author"],
    });
    if (!article) throw new Error("ArticleNotFound");

    // فیلدهای ساده
    if (typeof input.title === "string") article.title = input.title.trim();
    if (typeof input.slug !== "undefined") article.slug = input.slug ?? null;
    if (typeof input.subject !== "undefined") article.subject = input.subject ?? null;
    if (typeof input.mainText === "string") article.mainText = input.mainText;
    if (typeof input.secondaryText !== "undefined") article.secondaryText = input.secondaryText ?? null;
    if (typeof input.introduction !== "undefined") article.introduction = input.introduction ?? null;
    if (typeof input.quotes !== "undefined") article.quotes = input.quotes ?? null;
    if (typeof input.readingPeriod !== "undefined") article.readingPeriod = Number(input.readingPeriod ?? 0) || 0;
    if (typeof input.summary !== "undefined") article.summary = Array.isArray(input.summary) ? input.summary : null;

    // thumbnail URL
    if (typeof input.thumbnail !== "undefined") {
      article.thumbnail = input.thumbnail?.trim() || null;
    }

    // دسته‌بندی تکی (الزامی: حذف مجاز نیست)
    if (typeof input.categoryId !== "undefined") {
      if (!input.categoryId) throw new Error("CategoryRequired");
      const cat = await this.categoryRepo.findOne({ where: { id: input.categoryId } });
      if (!cat) throw new Error("CategoryNotFound");
      (article as any).category = cat;
    }

    // تگ‌ها (چندتایی)
    if (input.tagIds) {
      if (input.tagIds.length === 0) {
        article.tags = [];
      } else {
        const tgs = await this.tagRepo.findBy({ id: In(input.tagIds) });
        if (tgs.length !== input.tagIds.length) throw new Error("SomeTagIdsNotFound");
        article.tags = tgs;
      }
    }

    const saved = await this.articleRepo.save(article);
    return this.mapArticleToDTO(saved);
  }

  /** لیست با فیلترهای ساده */
  async list(query: ListArticlesQuery): Promise<ListResult<ArticleDTO>> {
    const page = Math.max(1, query.page ?? 1);
    const perPage = Math.max(1, Math.min(100, query.perPage ?? 10));
    const skip = (page - 1) * perPage;

    const qb = this.articleRepo
      .createQueryBuilder("a")
      .leftJoinAndSelect("a.author", "author")
      .leftJoinAndSelect("a.category", "cat") // ✅ تکی
      .leftJoinAndSelect("a.tags", "tag");

    if (query.categoryId) qb.andWhere("cat.id = :cid", { cid: query.categoryId });
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

  /** حذف مقاله */
  async delete(id: string): Promise<boolean> {
    const found = await this.articleRepo.findOne({ where: { id } });
    if (!found) return false;
    await this.articleRepo.remove(found);
    return true;
  }

  /** کامنت‌ها: لیست */
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

  /** افزودن کامنت */
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
