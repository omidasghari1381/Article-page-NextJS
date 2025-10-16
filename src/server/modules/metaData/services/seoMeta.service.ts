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
  publishedTime?: Date | string | null;
  modifiedTime?: Date | string | null;
  authorName?: string | null;
  tags?: string[] | null;
};

export type SeoMetaDTO = {
  id: string;
  entityType: SeoEntityType;
  entityId: string;
  locale: string;
  useAuto: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  robots: RobotsSetting | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  twitterCard: TwitterCardType | null;
  publishedTime: string | null;
  modifiedTime: string | null;
  authorName: string | null;
  tags: string[] | null;
  createdAt?: string;
  updatedAt?: string;
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

  private toISO(v: unknown) {
    if (!v) return null;
    const d = typeof v === "string" ? new Date(v) : (v as Date);
    return isNaN(d.getTime()) ? null : d.toISOString();
  }

  private toDTO(e: SeoMeta): SeoMetaDTO {
    return {
      id: e.id,
      entityType: e.entityType,
      entityId: e.entityId,
      locale: e.locale ?? "",
      useAuto: !!e.useAuto,
      seoTitle: e.seoTitle ?? null,
      seoDescription: e.seoDescription ?? null,
      canonicalUrl: e.canonicalUrl ?? null,
      robots: e.robots ?? null,
      ogTitle: e.ogTitle ?? null,
      ogDescription: e.ogDescription ?? null,
      ogImageUrl: e.ogImageUrl ?? null,
      twitterCard: e.twitterCard ?? null,
      publishedTime: this.toISO(e.publishedTime) ?? null,
      modifiedTime: this.toISO(e.modifiedTime) ?? null,
      authorName: e.authorName ?? null,
      tags: e.tags ?? null,
      createdAt: this.toISO((e as any).createdAt) ?? undefined,
      updatedAt: this.toISO((e as any).updatedAt) ?? undefined,
    };
  }

  async getBy(
    entityType: SeoEntityType,
    entityId: string,
    locale = ""
  ): Promise<SeoMetaDTO | null> {
    const repo = await this.repo();
    const ent = await repo.findOne({
      where: { entityType, entityId, locale: locale.trim() },
    });
    return ent ? this.toDTO(ent) : null;
  }

  async create(
    entityType: SeoEntityType,
    entityId: string,
    fields: SeoFields,
    locale = ""
  ) {
    const repo = await this.repo();
    const lc = locale.trim();

    const exists = await repo.findOne({
      where: { entityType, entityId, locale: lc },
      withDeleted: false,
    });
    if (exists)
      throw new Error(
        `SEO meta already exists for ${entityType}(${entityId}) locale="${lc}".`
      );

    const payload: Partial<SeoMeta> = {
      entityType,
      entityId,
      locale: lc,
      useAuto: fields.useAuto ?? true,
      seoTitle: fields.seoTitle ?? null,
      seoDescription: fields.seoDescription ?? null,
      canonicalUrl: fields.canonicalUrl ?? null,
      robots: fields.robots ?? null,
      ogTitle: fields.ogTitle ?? null,
      ogDescription: fields.ogDescription ?? null,
      ogImageUrl: fields.ogImageUrl ?? null,
      twitterCard: fields.twitterCard ?? null,
      publishedTime: toDateOrNull(fields.publishedTime),
      modifiedTime: toDateOrNull(fields.modifiedTime),
      authorName: fields.authorName ?? null,
      tags: fields.tags ?? null,
    };

    const saved = await repo.save(repo.create(payload));
    return this.toDTO(saved);
  }

  async update(
    entityType: SeoEntityType,
    entityId: string,
    fields: SeoFields,
    locale = ""
  ) {
    const repo = await this.repo();
    const lc = locale.trim();

    const existing = await repo.findOne({
      where: { entityType, entityId, locale: lc },
    });
    if (!existing)
      throw new Error(
        `SEO meta not found for ${entityType}(${entityId}) locale="${lc}".`
      );

    if (has(fields, "useAuto")) existing.useAuto = !!fields.useAuto;
    if (has(fields, "seoTitle")) existing.seoTitle = fields.seoTitle ?? null;
    if (has(fields, "seoDescription"))
      existing.seoDescription = fields.seoDescription ?? null;
    if (has(fields, "canonicalUrl"))
      existing.canonicalUrl = fields.canonicalUrl ?? null;
    if (has(fields, "robots")) existing.robots = fields.robots ?? null;
    if (has(fields, "ogTitle")) existing.ogTitle = fields.ogTitle ?? null;
    if (has(fields, "ogDescription"))
      existing.ogDescription = fields.ogDescription ?? null;
    if (has(fields, "ogImageUrl"))
      existing.ogImageUrl = fields.ogImageUrl ?? null;
    if (has(fields, "twitterCard"))
      existing.twitterCard = fields.twitterCard ?? null;
    if (has(fields, "publishedTime"))
      existing.publishedTime = toDateOrNull(fields.publishedTime);
    if (has(fields, "modifiedTime"))
      existing.modifiedTime = toDateOrNull(fields.modifiedTime);
    if (has(fields, "authorName"))
      existing.authorName = fields.authorName ?? null;
    if (has(fields, "tags")) existing.tags = fields.tags ?? null;

    const saved = await repo.save(existing);
    return this.toDTO(saved);
  }
  async upsert(
    entityType: SeoEntityType,
    entityId: string,
    fields: SeoFields,
    locale = ""
  ): Promise<SeoMetaDTO> {
    const repo = await this.repo();
    const lc = locale.trim();
    const existing = await repo.findOne({
      where: { entityType, entityId, locale: lc },
    });
    if (existing) return this.update(entityType, entityId, fields, lc);
    return this.create(entityType, entityId, fields, lc);
  }

  async delete(
    entityType: SeoEntityType,
    entityId: string,
    locale = ""
  ): Promise<void> {
    const repo = await this.repo();
    const res: DeleteResult = await repo.delete({
      entityType,
      entityId,
      locale: locale.trim(),
    });
    if (!res.affected)
      throw new Error(
        `Nothing to delete for ${entityType}(${entityId}) locale="${locale.trim()}".`
      );
  }
}
