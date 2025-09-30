import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { SeoMeta } from "./seoMeta.entity";

@Entity("seo_meta_history")
@Index(["seoMetaId"])
export class SeoMetaHistory extends AbstractEntity {
  // اشاره منطقی به رکورد seo_meta
  @Column({ type: "char", length: 36 })
  seoMetaId!: string;

  @ManyToOne(() => SeoMeta, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "seoMetaId", referencedColumnName: "id" })
  seoMeta!: SeoMeta;

  // شناسه کاربر ویرایشگر (در صورت نیاز)
  @Column({ type: "char", length: 36, nullable: true })
  changedBy!: string | null;

  // Snapshot یا Diff از تغییرات
  @Column({ type: "json" })
  changes!: Record<string, any>;
}
