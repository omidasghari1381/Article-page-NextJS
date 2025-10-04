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
import { ArticleCategory } from "./articleCategory.entity";
import { MediaItem } from "../../media/entities/mediaItem.entity";
import { ArticleTag } from "./articleTages.entity";

@Entity({ name: "articles" })
@Index("idx_articles_title", ["title"])
@Index("uq_articles_slug", ["slug"], { unique: true })
export class Article extends AbstractEntity {
  @Column({ type: "varchar", length: 200 })
  title!: string;

  /** slug اختیاری اما بسیار توصیه‌شده برای سئو و مسیرها */
  @Column({ type: "varchar", length: 220, nullable: true })
  slug!: string | null;

  /** فقط id نویسنده نگه‌داری می‌شود، حذف نویسنده مقاله را پاک نمی‌کند */
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

  /** مدت مطالعه به دقیقه */
  @Column({ type: "int", unsigned: true, default: 0 })
  readingPeriod!: number;

  /** خلاصه‌های گلوله‌ای/هایلایت‌ها */
  @Column({ type: "json", nullable: true })
  summary!: string[] | null;
}
