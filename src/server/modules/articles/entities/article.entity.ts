import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
} from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { User } from "../../users/entities/user.entity";
import { ArticleCategory } from "../../categories/entities/category.entity";
import { ArticleTag } from "../../tags/entities/tage.entity";

@Entity({ name: "articles" })
@Index("idx_articles_title", ["title"])
@Index("uq_articles_slug", ["slug"], { unique: true })
export class Article extends AbstractEntity {
  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "varchar", length: 220, nullable: true })
  slug!: string | null;

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "authorId" })
  author!: User | null;

  @Column({ type: "text" })
  mainText!: string;

  @Column({ type: "text", nullable: true })
  secondaryText!: string | null;

  @Column({ type: "varchar", length: 300, nullable: true })
  subject!: string | null;

  @Column({ type: "varchar", length: 300, nullable: true })
  thumbnail!: string | null;

  @Column({ type: "text", nullable: true })
  introduction!: string | null;

  @Column({ type: "text", nullable: true })
  quotes!: string | null;

  @ManyToOne(() => ArticleCategory, {
    nullable: false,
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn({ name: "categoryId" })
  category!: ArticleCategory;

  @ManyToMany(() => ArticleTag, { cascade: false })
  @JoinTable({
    name: "article_tags",
    joinColumn: {
      name: "article_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "tag_id",
      referencedColumnName: "id",
    },
  })
  tags!: ArticleTag[];

  @Column({ type: "int", default: 0 })
  viewCount!: number;

  @Column({ type: "int", unsigned: true, default: 0 })
  readingPeriod!: number;

  @Column({ type: "json", nullable: true })
  summery!: string[] | null;

  // @Column({ type: "boolean", default: false })
  // isActive!: boolean;
}
