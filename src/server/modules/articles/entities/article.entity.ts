import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { User } from "../../users/entities/user.entity"; // value-import
import { articleCategoryEnum } from "../enums/articleCategory.enum";

@Entity("articles")
export class Article extends AbstractEntity {
  @Column({ type: "varchar", length: 200 })
  title!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
  @JoinColumn({ name: "authorId" })
  author!: User;

  @Column({
    type: "text",
    nullable: false,
  })
  mainText!: string;
  
  @Column({
    type: "text",
    nullable: false,
  })
  secondryText!: string;


  @Column({
    type: "text",
    nullable: false,
  })
  subject!: string;
  
  @Column({
    type: "text",
    nullable: true,
  })
  thumbnail!: string | null;

  @Column({
    type: "text",
    nullable: true,
  })
  Introduction!: string | null;

  @Column({
    type: "text",
    nullable: true,
  })
  quotes!: string | null;

  @Column({ type: "varchar", length: 64 })
  category!: articleCategoryEnum;

  @Column({
    default: false,
  })
  showStatus!: boolean;

  @Column({
    type: "int",
    default: 0,
  })
  viewCount!: number;

  @Column({
    type: "varchar",
    length: 256,
    nullable: false,
  })
  readingPeriod!: string;

  @Column({
    type: "json",
    nullable: false,
  })
  summery!: string[];
}
