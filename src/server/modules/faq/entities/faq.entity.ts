import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { Entity, Column } from "typeorm";
import { faqCategory } from "../enums/faqCategory.enum";

@Entity()
export class FAQ extends AbstractEntity {
  @Column({
    type: "varchar",
    length: 256,
    nullable: false,
    unique: true,
  })
  question!: string;

  @Column({
    type: "text",
    nullable: false,
  })
  answer!: string;

  @Column({
    type: "simple-enum",
    enum: faqCategory,
  })
  category!: faqCategory;
}
