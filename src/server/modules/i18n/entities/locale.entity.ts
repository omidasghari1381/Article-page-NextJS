import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity({ name: "locales" })
export class Locale extends AbstractEntity {
  @PrimaryGeneratedColumn("uuid")
  @Index({ unique: true })
  @Column({ length: 10 })
  code!: string;

  @Column({ length: 64 })
  name!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: "int", default: 1 })
  version!: number;

  @Column({ type: "int", default: 0 })
  sortOrder!: number;
}
