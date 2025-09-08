import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { Entity, Column } from "typeorm";

@Entity()
export class Article extends AbstractEntity {
  @Column({
    type: "varchar",
    length: 256,
    nullable: false,
    unique: true,
  })
  title!: string;

  @Column({
    type: "text",
    nullable: false,
  })
  text!: string;

  @Column({
    type: "text",
    nullable:true
  })
  thumbnail!: string;

  @Column({
    default: false,
  })
  showStatus!: boolean;
}
