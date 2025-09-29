// import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
  CreateDateColumn, UpdateDateColumn, Index, Unique
} from "typeorm";

@Entity({ name: "categories" })
@Unique(["slug"])
export class ArticleCategory extends AbstractEntity {
  @PrimaryGeneratedColumn({ type: "bigint", unsigned: true })
  id!: string;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Index()
  @Column({ type: "varchar", length: 180 })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @ManyToOne(() => ArticleCategory, (c) => c.children, {
    nullable: true,
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  parent?: ArticleCategory | null;

  @OneToMany(() => ArticleCategory, (c) => c.parent)
  children!: ArticleCategory[];

  @Column({ type: "int", unsigned: true, default: 0 })
  depth!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
