// src/server/modules/users/entities/user.entity.ts
import { Entity, Column, Index } from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { userRoleEnum } from "../enums/userRoleEnum";

@Entity("users")
@Index("UQ_users_phone_active", ["phone", "isDeleted"], { unique: true }) // تنها یک کاربر فعال با این phone
export class User extends AbstractEntity {
  @Column({ type: "varchar", length: 80, nullable: false })
  firstName!: string;

  @Column({ type: "varchar", length: 80, nullable: false })
  lastName!: string;

  @Column({ type: "varchar", length: 64, default: userRoleEnum.CLIENT })
  role!: userRoleEnum;

  @Column({ type: "varchar", length: 20, nullable: false })
  phone!: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  passwordHash!: string;

  // فلگ کمکی برای یونیک بودن phone بین رکوردهای زنده
  @Column({ type: "tinyint", width: 1, default: 0 })
  isDeleted!: 0 | 1;
}
