// src/server/modules/metaData/services/seoMeta.service.ts
import { DeleteResult, Repository } from "typeorm";
import { getDataSource } from "@/server/db/typeorm.datasource";
import {
  SeoMeta,
  SeoEntityType,
  RobotsSetting,
  TwitterCardType,
} from "@/server/modules/metaData/entities/seoMeta.entity";

export type SeoFields = {
  useAuto?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  robots?: RobotsSetting | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  twitterCard?: TwitterCardType | null;
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
  authorName?: string | null;
  tags?: string[] | null;
};

export class SeoMetaService {
  private repoP: Promise<Repository<SeoMeta>>;

  constructor() {
    this.repoP = (async () => {
      const ds = await getDataSource();
      return ds.getRepository(SeoMeta);
    })();
  }
  private async repo() {
    return this.repoP;
  }

  async getBy(
    entityType: SeoEntityType,
    entityId: string,
    locale: string = ""
  ): Promise<SeoMeta | null> {
    const repo = await this.repo();
    return repo.findOne({ where: { entityType, entityId, locale } });
  }

  async getForArticle(articleId: string, locale = "") {
    return this.getBy(SeoEntityType.ARTICLE, articleId, locale);
  }
  async getForCategory(categoryId: string, locale = "") {
    return this.getBy(SeoEntityType.CATEGORY, categoryId, locale);
  }

  async createGeneric(
    entityType: SeoEntityType,
    entityId: string,
    fields: SeoFields,
    locale: string = ""
  ): Promise<SeoMeta> {
    const repo = await this.repo();

    const exists = await repo.findOne({
      where: { entityType, entityId, locale },
      withDeleted: false,
    });
    if (exists) {
      throw new Error(
        `SEO meta already exists for ${entityType}(${entityId}) locale="${locale}".`
      );
    }

    const rec = repo.create({
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

    return repo.save(rec);
  }

  async createForArticle(articleId: string, fields: SeoFields, locale = "") {
    return this.createGeneric(SeoEntityType.ARTICLE, articleId, fields, locale);
  }
  async createForCategory(categoryId: string, fields: SeoFields, locale = "") {
    return this.createGeneric(SeoEntityType.CATEGORY, categoryId, fields, locale);
  }

  private assignIfProvided<T extends object, K extends keyof T>(
    obj: T,
    source: Partial<T>,
    key: K
  ) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      (obj as any)[key] = (source as any)[key] ?? null;
    }
  }

  async updateGeneric(
    entityType: SeoEntityType,
    entityId: string,
    fields: SeoFields,
    locale: string = ""
  ): Promise<SeoMeta> {
    const repo = await this.repo();

    const existing = await repo.findOne({
      where: { entityType, entityId, locale },
    });
    if (!existing) {
      throw new Error(
        `SEO meta not found for ${entityType}(${entityId}) locale="${locale}".`
      );
    }

    if (Object.prototype.hasOwnProperty.call(fields, "useAuto")) {
      existing.useAuto = Boolean(fields.useAuto);
    }

    this.assignIfProvided(existing, fields, "seoTitle");
    this.assignIfProvided(existing, fields, "seoDescription");
    this.assignIfProvided(existing, fields, "canonicalUrl");
    this.assignIfProvided(existing, fields, "robots");
    this.assignIfProvided(existing, fields, "ogTitle");
    this.assignIfProvided(existing, fields, "ogDescription");
    this.assignIfProvided(existing, fields, "ogImageUrl");
    this.assignIfProvided(existing, fields, "twitterCard");
    this.assignIfProvided(existing, fields, "publishedTime");
    this.assignIfProvided(existing, fields, "modifiedTime");
    this.assignIfProvided(existing, fields, "authorName");

    if (Object.prototype.hasOwnProperty.call(fields, "tags")) {
      existing.tags = fields.tags ?? null;
    }

    return repo.save(existing);
  }

  async updateForArticle(articleId: string, fields: SeoFields, locale = "") {
    return this.updateGeneric(SeoEntityType.ARTICLE, articleId, fields, locale);
  }
  async updateForCategory(categoryId: string, fields: SeoFields, locale = "") {
    return this.updateGeneric(SeoEntityType.CATEGORY, categoryId, fields, locale);
  }

  async upsertGeneric(
    entityType: SeoEntityType,
    entityId: string,
    fields: SeoFields,
    locale: string = ""
  ): Promise<SeoMeta> {
    const repo = await this.repo();

    const existing = await repo.findOne({
      where: { entityType, entityId, locale },
    });
    if (existing) {
      return this.updateGeneric(entityType, entityId, fields, locale);
    }
    return this.createGeneric(entityType, entityId, fields, locale);
  }

  async upsertForArticle(articleId: string, fields: SeoFields, locale = "") {
    return this.upsertGeneric(SeoEntityType.ARTICLE, articleId, fields, locale);
  }
  async upsertForCategory(categoryId: string, fields: SeoFields, locale = "") {
    return this.upsertGeneric(SeoEntityType.CATEGORY, categoryId, fields, locale);
  }

  async deleteBy(entityType: SeoEntityType, entityId: string, locale = ""): Promise<void> {
    const repo = await this.repo();
    const res: DeleteResult = await repo.delete({ entityType, entityId, locale });
    if (!res.affected) {
      throw new Error(
        `Nothing to delete for ${entityType}(${entityId}) locale="${locale}".`
      );
    }
  }

  async deleteForArticle(articleId: string, locale = "") {
    return this.deleteBy(SeoEntityType.ARTICLE, articleId, locale);
  }
  async deleteForCategory(categoryId: string, locale = "") {
    return this.deleteBy(SeoEntityType.CATEGORY, categoryId, locale);
  }
}
