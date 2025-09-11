import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
} from "typeorm";

export abstract class AbstractEntity extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn({ type: "datetime", precision: 6 })
  createdAt!: Date;

  @UpdateDateColumn({ type: "datetime", precision: 6 })
  updatedAt!: Date;
}