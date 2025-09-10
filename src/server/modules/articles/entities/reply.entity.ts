// src/server/modules/articles/entities/reply.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { User } from "../../users/entities/user.entity";
import { CommentArticle } from "./comment.entity";

@Entity("article_comment_replies")
export class ReplyComment extends AbstractEntity {
  @Column({ type: "varchar", length: 200 })
  text!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => CommentArticle, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "commentId" })
  comment!: CommentArticle;
}