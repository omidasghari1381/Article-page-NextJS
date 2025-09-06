import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Faq {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  question!: string;

  @Column({ type: "text" })
  answer!: string;

  @Column({ type: "int", default: 0 })
  order!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}