import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";

export abstract class AbstractEntity extends BaseEntity {
  // برای MySQL: uuid به صورت VARCHAR(36)
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  // بدون default؛ TypeORM خودش مقدار رو موقع insert می‌ذاره
  @CreateDateColumn({ type: "datetime", precision: 6 })
  createdAt!: Date;

  // بدون default و بدون onUpdate؛ TypeORM خودش موقع update مقدار می‌ده
  @UpdateDateColumn({ type: "datetime", precision: 6 })
  updatedAt!: Date;
}