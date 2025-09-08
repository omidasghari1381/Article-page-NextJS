import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { articleCategoryEnum } from "../enums/articleCategory.enum";
import { User } from "../../users/entities/user.entity";

@Entity()
export class Article extends AbstractEntity {
  @Column({
    type: "varchar",
    length: 256,
    nullable: false,
    unique: true,
  })
  title!: string;

  @ManyToOne(() => User, (u) => u.article, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

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
