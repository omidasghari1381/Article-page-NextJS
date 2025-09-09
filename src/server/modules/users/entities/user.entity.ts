import { Entity, Column, Index, OneToMany } from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { Article } from "../../articles/entities/article.entity"; // value-import

@Entity("users")
export class User extends AbstractEntity {
  @Column({ type: "varchar", length: 80, nullable: false })
  firstName!: string;

  @Column({ type: "varchar", length: 80, nullable: false })
  lastName!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 20,  nullable: false })
  phone!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  passwordHash!: string;
}