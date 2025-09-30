// seoMeta.service.ts
import { Repository, DeleteResult } from "typeorm";
import {
  SeoMeta,
  SeoEntityType,
  RobotsSetting,
  TwitterCardType,
} from "../entities/seoMeta.entity";

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
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
  authorName?: string | null;

  // Tags
  tags?: string[] | null;
};

export class SeoMetaService {
  constructor(private readonly repo: Repository<SeoMeta>) {}

  // ---------- CREATE ----------

  async createForArticle(
    articleId: string,
    fields: SeoFields,
    locale: string = ""
  ): Promise<SeoMeta> {
    return this.createGeneric(SeoEntityType.ARTICLE, articleId, fields, locale);
  }

  async createForCategory(
    categoryId: string,
    fields: SeoFields,
    locale: string = ""
  ): Promise<SeoMeta> {
    return this.createGeneric(
      SeoEntityType.CATEGORY,
      categoryId,
      fields,
      locale
    );
  }

  // ---------- GET ----------

  async getForArticle(
    articleId: string,
    locale: string = ""
  ): Promise<SeoMeta | null> {
    return this.repo.findOne({
      where: { entityType: SeoEntityType.ARTICLE, entityId: articleId, locale },
    });
  }

  async getForCategory(
    categoryId: string,
    locale: string = ""
  ): Promise<SeoMeta | null> {
    return this.repo.findOne({
      where: {
        entityType: SeoEntityType.CATEGORY,
        entityId: categoryId,
        locale,
      },
    });
  }

  // ---------- UPDATE ----------

  async updateForArticle(
    articleId: string,
    fields: SeoFields,
    locale: string = ""
  ): Promise<SeoMeta> {
    return this.updateGeneric(SeoEntityType.ARTICLE, articleId, fields, locale);
  }

  async updateForCategory(
    categoryId: string,
    fields: SeoFields,
    locale: string = ""
  ): Promise<SeoMeta> {
    return this.updateGeneric(
      SeoEntityType.CATEGORY,
      categoryId,
      fields,
      locale
    );
  }

  // ---------- DELETE ----------

  async deleteForArticle(
    articleId: string,
    locale: string = ""
  ): Promise<void> {
    await this.deleteGeneric(SeoEntityType.ARTICLE, articleId, locale);
  }

  async deleteForCategory(
    categoryId: string,
    locale: string = ""
  ): Promise<void> {
    await this.deleteGeneric(SeoEntityType.CATEGORY, categoryId, locale);
  }

  // ---------- private helpers ----------

  private async createGeneric(
    entityType: SeoEntityType,
    entityId: string,
    fields: SeoFields,
    locale: string
  ): Promise<SeoMeta> {
    const exists = await this.repo.findOne({
      where: { entityType, entityId, locale },
      withDeleted: false,
    });
    if (exists) {
      throw new Error(
        `SEO meta already exists for ${entityType}(${entityId}) locale="${locale}".`
      );
    }

    const record = this.repo.create({
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

    return this.repo.save(record);
  }

  private async updateGeneric(
    entityType: SeoEntityType,
    entityId: string,
    fields: SeoFields,
    locale: string
  ): Promise<SeoMeta> {
    const existing = await this.repo.findOne({
      where: { entityType, entityId, locale },
    });
    if (!existing) {
      throw new Error(
        `SEO meta not found for ${entityType}(${entityId}) locale="${locale}".`
      );
    }

    // فقط فیلدهایی که در ورودی آمده را به‌روزرسانی کن (از بین نرفتن مقادیر دیگر)
    const assignIfProvided = <K extends keyof SeoFields>(key: K) => {
      if (Object.prototype.hasOwnProperty.call(fields, key)) {
        // اجازه به null برای پاک‌کردن مقدار
        (existing as any)[key] = (fields as any)[key] ?? null;
      }
    };

    if (Object.prototype.hasOwnProperty.call(fields, "useAuto")) {
      existing.useAuto = Boolean(fields.useAuto);
    }

    assignIfProvided("seoTitle");
    assignIfProvided("seoDescription");
    assignIfProvided("canonicalUrl");
    assignIfProvided("robots");

    assignIfProvided("ogTitle");
    assignIfProvided("ogDescription");
    assignIfProvided("ogImageUrl");

    assignIfProvided("twitterCard");

    assignIfProvided("publishedTime");
    assignIfProvided("modifiedTime");
    assignIfProvided("authorName");

    if (Object.prototype.hasOwnProperty.call(fields, "tags")) {
      existing.tags = fields.tags ?? null;
    }

    return this.repo.save(existing);
  }

  private async deleteGeneric(
    entityType: SeoEntityType,
    entityId: string,
    locale: string
  ): Promise<void> {
    const res: DeleteResult = await this.repo.delete({
      entityType,
      entityId,
      locale,
    });
    if (!res.affected) {
      throw new Error(
        `Nothing to delete for ${entityType}(${entityId}) locale="${locale}".`
      );
    }
  }
}
