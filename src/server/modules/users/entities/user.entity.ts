import { Entity, Column, Index, OneToMany } from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import{ userRoleEnum } from "../enums/userRoleEnum";

@Entity("users")
export class User extends AbstractEntity {
  @Column({ type: "varchar", length: 80, nullable: false })
  firstName!: string;

  @Column({ type: "varchar", length: 80, nullable: false })
  lastName!: string;

  @Column({ type: "varchar", length: 64, default:userRoleEnum.CLIENT })
  role!: userRoleEnum;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 20,  nullable: false })
  phone!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  passwordHash!: string;
}