import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import {
  Entity, Column, ManyToOne, OneToMany,
 Index, Unique,
 JoinColumn
} from "typeorm";

@Entity({ name: "categories" })
@Unique("uq_categories_slug", ["slug"]) 
export class ArticleCategory extends AbstractEntity {
  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "varchar", length: 180 })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Index("idx_categories_parent_id")
  @ManyToOne(() => ArticleCategory, (c) => c.children, {
    nullable: true,
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })@JoinColumn({ name: "parentId" })
  parent?: ArticleCategory | null;

  @OneToMany(() => ArticleCategory, (c) => c.parent)
  children!: ArticleCategory[];

  @Column({ type: "int", unsigned: true, default: 0 })
  depth!: number;
}

