import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { User } from "../../users/entities/user.entity"; // value-import
import { articleCategoryEnum } from "../enums/articleCategory.enum";

@Entity("articles")
export class Article extends AbstractEntity {
  @Column({ type: "varchar", length: 200 })
  title!: string;

  @ManyToOne(() => User, (user) => user.articles, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "authorId" })
  author!: User;

    @Column({
      type: "text",
      nullable: false,
    })
    mainText!: string;
  
    @Column({
      type: "text",
      nullable: true,
    })
    thumbnail!: string;
  
    @Column({
      type: "text",
      nullable: true,
      length: 1300,
    })
    Introduction!: string;
  
    @Column({
      type: "text",
      enum: true,
    })
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
}