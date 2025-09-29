import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { User } from "../../users/entities/user.entity";
import { ArticleCategory } from "./articleCategory.entity";

@Entity("articles")
export class Article extends AbstractEntity {
  @Column({ type: "varchar", length: 200 })
  title!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "authorId" })
  author!: User;

  @Column({ type: "text", nullable: false })
  mainText!: string;

  @Column({ type: "text", nullable: false })
  secondryText!: string;

  @Column({ type: "text", nullable: false })
  subject!: string;

  @Column({ type: "text", nullable: true })
  thumbnail!: string | null;

  @Column({ type: "text", nullable: true })
  Introduction!: string | null;

  @Column({ type: "text", nullable: true })
  quotes!: string | null;

  // @Column({ type: "varchar", length: 64 })
  // category!: articleCategoryEnum;
  @ManyToMany(() => ArticleCategory, { cascade: false })
  @JoinTable({
    name: "article_categories",
    joinColumn: {
      name: "article_id",
      referencedColumnName: "id",
      onDelete: "CASCADE",
    },
    inverseJoinColumn: {
      name: "category_id",
      referencedColumnName: "id",
      onDelete: "CASCADE",
    },
  })
  categories!: ArticleCategory[];

  @Column({ type: "int", default: 0 })
  viewCount!: number;

  @Column({ type: "varchar", length: 256, nullable: false })
  readingPeriod!: string;

  @Column({ type: "json", nullable: false })
  summery!: string[];
}
