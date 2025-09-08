import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { Entity, Column, Index, OneToMany } from "typeorm";
import { Article } from "../../articles/entities/article.entity";
import { ArticleComment } from "../../articles/entities/comment.entity";

@Entity("users")
export class User extends AbstractEntity {
  @Column({ type: "varchar", length: 80, nullable: false })
  firstName!: string;

  @Column({ type: "varchar", length: 80, nullable: false })
  lastName!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 20, unique: true, nullable: false })
  phone!: string;

  // هش پسورد
  @Column({ type: "varchar", length: 255, nullable: false })
  passwordHash!: string;

  @OneToMany(() => Article, (article) => article.user)
  article!: Article;
  @OneToMany(() => ArticleComment, (comment) => comment.user)
  articleComment!: ArticleComment;
}
