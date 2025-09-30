import {
  Entity,
  Column,
  Index,
  Unique,
} from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";

export enum SeoEntityType {
  ARTICLE = "article",
  CATEGORY = "category",
}

export enum RobotsSetting {
  INDEX_FOLLOW = "index,follow",
  NOINDEX_FOLLOW = "noindex,follow",
  INDEX_NOFOLLOW = "index,nofollow",
  NOINDEX_NOFOLLOW = "noindex,nofollow",
}

export enum TwitterCardType {
  SUMMARY = "summary",
  SUMMARY_LARGE_IMAGE = "summary_large_image",
}

@Entity({ name: "seo_meta" })
@Unique("uniq_entity_locale", ["entityType", "entityId", "locale"])
@Index("idx_entity", ["entityType", "entityId"])
@Index("idx_locale", ["locale"])
export class SeoMeta extends AbstractEntity {
  @Column({ type: "enum", enum: SeoEntityType })
  entityType!: SeoEntityType;

  @Column({ type: "char", length: 36 })
  entityId!: string;

  // برای یکتایی مطمئن، NULL نباشه؛ خالی ("") = پیش‌فرض/عمومی
  @Column({ type: "varchar", length: 16, default: "" })
  locale!: string;

  // حالت خودکار: اگر true باشد، فیلدهای زیر نقش override دارند و می‌توانند تهی باشند
  @Column({ type: "boolean", default: true })
  useAuto!: boolean;

  // --- SEO Basics ---
  @Column({ type: "varchar", length: 255, nullable: true })
  seoTitle!: string | null;

  @Column({ type: "varchar", length: 320, nullable: true })
  seoDescription!: string | null;

  @Column({ type: "text", nullable: true })
  canonicalUrl!: string | null;

  @Column({ type: "enum", enum: RobotsSetting, nullable: true })
  robots!: RobotsSetting | null;

  // --- Open Graph ---
  @Column({ type: "varchar", length: 255, nullable: true })
  ogTitle!: string | null;

  @Column({ type: "varchar", length: 320, nullable: true })
  ogDescription!: string | null;

  @Column({ type: "text", nullable: true })
  ogImageUrl!: string | null; // URL از سیستم مدیا شما

  // --- Twitter ---
  @Column({ type: "enum", enum: TwitterCardType, nullable: true })
  twitterCard!: TwitterCardType | null;

  // --- Article-like meta ---
  @Column({ type: "datetime", nullable: true })
  publishedTime!: Date | null;

  @Column({ type: "datetime", nullable: true })
  modifiedTime!: Date | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  authorName!: string | null;

  // برچسب‌ها (اختیاری)
  @Column({ type: "json", nullable: true })
  tags!: string[] | null;
}
