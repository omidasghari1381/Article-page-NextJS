import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { Entity, Column, Unique } from "typeorm";

@Entity({ name: "tags" })
@Unique("uq_tags_slug", ["slug"]) 
export class ArticleTag extends AbstractEntity {
  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "varchar", length: 180 })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;
}
