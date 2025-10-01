import { Entity, Column, Index } from "typeorm";
import { SimpleMediaType } from "../enums/media.enums";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";

@Entity({ name: "media_items" })
@Index(["type"])
@Index(["name"])
export class MediaItem extends AbstractEntity {
  @Column({ type: "varchar", length: 255 })
  name!: string; // نام نمایشی

  @Column({ type: "text", nullable: true })
  description!: string | null; // توضیحات

  @Column({ type: "varchar", length: 1000 })
  url!: string; // آدرس فایل (می‌تونه local یا CDN باشه)

  @Column({ type: "enum", enum: SimpleMediaType })
  type!: SimpleMediaType;
}
