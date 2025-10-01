// src/server/modules/metaData/services/seoMeta.service.ts
import { DataSource, DeleteResult } from "typeorm";
import { SeoMeta, SeoEntityType, RobotsSetting, TwitterCardType } from "@/server/modules/metaData/entities/seoMeta.entity";

export type SeoFields = {
  useAuto?: boolean;

  // SEO Basics
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  robots?: RobotsSetting | null;

  // Open Graph
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;

  // Twitter
  twitterCard?: TwitterCardType | null;

  // Article-like meta
  publishedTime?: Date | null; // ← مسیر شما این‌ها را Date می‌فرستد (تبدیل ISO → Date را در route انجام بده)
  modifiedTime?: Date | null;
  authorName?: string | null;

  // Tags
  tags?: string[] | null;
};

export class SeoMetaService {
  constructor(private ds: DataSource) {}
  private get repo() {
    return this.ds.getRepository(SeoMeta);
  }

  /* ------------------------- GET ------------------------- */
  async getBy(entityType: SeoEntityType, entityId: string, locale: string = ""): Promise<SeoMeta | null> {
    return this.repo.findOne({ where: { entityType, entityId, locale } });
  }

  async getForArticle(articleId: string, locale: string = ""): Promise<SeoMeta | null> {
    return this.getBy(SeoEntityType.ARTICLE, articleId, locale);
  }

  async getForCategory(categoryId: string, locale: string = ""): Promise<SeoMeta | null> {
    return this.getBy(SeoEntityType.CATEGORY, categoryId, locale);
  }

  /* ------------------------ CREATE ----------------------- */
  async createGeneric(
    entityType: SeoEntityType,
    entityId: string,
    fields: SeoFields,
    locale: string = ""
  ): Promise<SeoMeta> {
    const exists = await this.repo.findOne({ where: { entityType, entityId, locale }, withDeleted: false });
    if (exists) {
      throw new Error(`SEO meta already exists for ${entityType}(${entityId}) locale="${locale}".`);
    }

    const rec = this.repo.create({
      entityType,
      entityId,
      locale,
      useAuto: fields.useAuto ?? true,

      seoTitle: fields.seoTitle ?? null,
      seoDescription: fields.seoDescription ?? null,
      canonicalUrl: fields.canonicalUrl ?? null,
      robots: fields.robots ?? null,

      ogTitle: fields.ogTitle ?? null,
      ogDescription: fields.ogDescription ?? null,
      ogImageUrl: fields.ogImageUrl ?? null,

      twitterCard: fields.twitterCard ?? null,

      publishedTime: fields.publishedTime ?? null,
      modifiedTime: fields.modifiedTime ?? null,
      authorName: fields.authorName ?? null,

      tags: fields.tags ?? null,
    });

    return this.repo.save(rec);
  }

  async createForArticle(articleId: string, fields: SeoFields, locale: string = ""): Promise<SeoMeta> {
    return this.createGeneric(SeoEntityType.ARTICLE, articleId, fields, locale);
  }

  async createForCategory(categoryId: string, fields: SeoFields, locale: string = ""): Promise<SeoMeta> {
    return this.createGeneric(SeoEntityType.CATEGORY, categoryId, fields, locale);
  }

  /* ------------------------ UPDATE ----------------------- */
  private assignIfProvided<T extends object, K extends keyof T>(obj: T, source: Partial<T>, key: K) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      // اجازه به null برای پاک‌کردن مقدار
      (obj as any)[key] = (source as any)[key] ?? null;
    }
  }

  async updateGeneric(
    entityType: SeoEntityType,
    entityId: string,
    fields: SeoFields,
    locale: string = ""
  ): Promise<SeoMeta> {
    const existing = await this.repo.findOne({ where: { entityType, entityId, locale } });
    if (!existing) {
      throw new Error(`SEO meta not found for ${entityType}(${entityId}) locale="${locale}".`);
    }

    if (Object.prototype.hasOwnProperty.call(fields, "useAuto")) {
      existing.useAuto = Boolean(fields.useAuto);
    }

    // Basics
    this.assignIfProvided(existing, fields, "seoTitle");
    this.assignIfProvided(existing, fields, "seoDescription");
    this.assignIfProvided(existing, fields, "canonicalUrl");
    this.assignIfProvided(existing, fields, "robots");

    // OG
    this.assignIfProvided(existing, fields, "ogTitle");
    this.assignIfProvided(existing, fields, "ogDescription");
    this.assignIfProvided(existing, fields, "ogImageUrl");

    // Twitter
    this.assignIfProvided(existing, fields, "twitterCard");

    // Article-like
    this.assignIfProvided(existing, fields, "publishedTime");
    this.assignIfProvided(existing, fields, "modifiedTime");
    this.assignIfProvided(existing, fields, "authorName");

    // Tags (به دلیل آرایه‌بودن جداگانه هندل می‌کنیم)
    if (Object.prototype.hasOwnProperty.call(fields, "tags")) {
      existing.tags = fields.tags ?? null;
    }

    return this.repo.save(existing);
  }

  async updateForArticle(articleId: string, fields: SeoFields, locale: string = ""): Promise<SeoMeta> {
    return this.updateGeneric(SeoEntityType.ARTICLE, articleId, fields, locale);
  }

  async updateForCategory(categoryId: string, fields: SeoFields, locale: string = ""): Promise<SeoMeta> {
    return this.updateGeneric(SeoEntityType.CATEGORY, categoryId, fields, locale);
  }

  /* ------------------------ UPSERT ----------------------- */
  async upsertGeneric(
    entityType: SeoEntityType,
    entityId: string,
    fields: SeoFields,
    locale: string = ""
  ): Promise<SeoMeta> {
    const existing = await this.repo.findOne({ where: { entityType, entityId, locale } });
    if (existing) {
      return this.updateGeneric(entityType, entityId, fields, locale);
    }
    return this.createGeneric(entityType, entityId, fields, locale);
  }

  async upsertForArticle(articleId: string, fields: SeoFields, locale: string = ""): Promise<SeoMeta> {
    return this.upsertGeneric(SeoEntityType.ARTICLE, articleId, fields, locale);
  }

  async upsertForCategory(categoryId: string, fields: SeoFields, locale: string = ""): Promise<SeoMeta> {
    return this.upsertGeneric(SeoEntityType.CATEGORY, categoryId, fields, locale);
  }

  /* ------------------------ DELETE ----------------------- */
  async deleteBy(entityType: SeoEntityType, entityId: string, locale: string = ""): Promise<void> {
    const res: DeleteResult = await this.repo.delete({ entityType, entityId, locale });
    if (!res.affected) {
      throw new Error(`Nothing to delete for ${entityType}(${entityId}) locale="${locale}".`);
    }
  }

  async deleteForArticle(articleId: string, locale: string = ""): Promise<void> {
    return this.deleteBy(SeoEntityType.ARTICLE, articleId, locale);
  }

  async deleteForCategory(categoryId: string, locale: string = ""): Promise<void> {
    return this.deleteBy(SeoEntityType.CATEGORY, categoryId, locale);
  }
}
