import {
  Entity,
  Column,
  Index,
  Unique,
} from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { SeoEntityType, TwitterCardType,  RobotsSetting } from "../enums/entity.enum";



@Entity({ name: "seo_meta" })
@Unique("uniq_entity_locale", ["entityType", "entityId", "locale"])
@Index("idx_entity", ["entityType", "entityId"])
@Index("idx_locale", ["locale"])
export class SeoMeta extends AbstractEntity {
  @Column({ type: "enum", enum: SeoEntityType })
  entityType!: SeoEntityType;

  @Column({ type: "char", length: 36 })
  entityId!: string;

  @Column({ type: "varchar", length: 16, default: "" })
  locale!: string;

  @Column({ type: "boolean", default: true })
  useAuto!: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  seoTitle!: string | null;

  @Column({ type: "varchar", length: 320, nullable: true })
  seoDescription!: string | null;

  @Column({ type: "text", nullable: true })
  canonicalUrl!: string | null;

  @Column({ type: "enum", enum: RobotsSetting, nullable: true })
  robots!: RobotsSetting | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  ogTitle!: string | null;

  @Column({ type: "varchar", length: 320, nullable: true })
  ogDescription!: string | null;

  @Column({ type: "text", nullable: true })
  ogImageUrl!: string | null; 

  @Column({ type: "enum", enum: TwitterCardType, nullable: true })
  twitterCard!: TwitterCardType | null;

  @Column({ type: "datetime", nullable: true })
  publishedTime!: Date | null;

  @Column({ type: "datetime", nullable: true })
  modifiedTime!: Date | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  authorName!: string | null;

  @Column({ type: "json", nullable: true })
  tags!: string[] | null;
}
export { TwitterCardType, SeoEntityType, RobotsSetting };

