// src/server/modules/articles/entities/comment.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { User } from "../../users/entities/user.entity";
import { Article } from "./article.entity";

@Entity("article_comments")
export class CommentArticle extends AbstractEntity {
  @Column({ type: "varchar", length: 200 })
  text!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Article, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "articleId" })
  article!: Article;

  @Column({ type: "int", default: 0 })
  like!: number;

  @Column({ type: "int", default: 0 })
  dislike!: number;
}