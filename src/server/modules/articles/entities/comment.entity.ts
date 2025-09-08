import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity()
export class ArticleComment extends AbstractEntity {
  @Column({
    type: "text",
    nullable: false,
  })
  text!: string;
  @ManyToOne(() => User, (u) => u.articleComment, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({
    type: "int",
    default: 0,
  })
  like!: number;

  @Column({
    type: "int",
    default: 0,
  })
  dislike!: number;
}
