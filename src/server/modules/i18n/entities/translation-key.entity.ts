import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, Unique } from "typeorm";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";
import { TranslationValue } from "./translation-value.entity";

@Entity({ name: "translation_keys" })
@Unique(["namespace", "key"])
export class TranslationKey extends AbstractEntity{
  @PrimaryGeneratedColumn("uuid") 

  @Index()
  @Column({ length: 128 })
  namespace!: string;

  @Column({ length: 256 })
  key!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @OneToMany(() => TranslationValue, (v) => v.tKey)
  values!: TranslationValue[];
}