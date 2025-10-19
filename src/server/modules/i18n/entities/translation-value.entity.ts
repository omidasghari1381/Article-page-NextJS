import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  JoinColumn,
} from "typeorm";
import { TranslationKey } from "./translation-key.entity";
import { AbstractEntity } from "@/server/core/abstracts/entity.base";

@Entity({ name: "translation_values" })
@Index(["tKey", "locale"], { unique: true })
export class TranslationValue extends AbstractEntity {
  @ManyToOne(() => TranslationKey, { onDelete: "CASCADE", eager: false })
  @JoinColumn({ name: "keyId" })
  tKey!: TranslationKey;

  @Index()
  @Column({ length: 10 })
  locale!: string;

  @Column({ type: "text" })
  value!: string;

  @Column({ default: false })
  isDraft!: boolean;
}
