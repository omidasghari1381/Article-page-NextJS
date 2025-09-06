import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { User } from "./User";

@Entity()
export class Article {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Index({ unique: true })
  @Column()
  slug!: string;

  @Column({ type: "text", nullable: true })
  excerpt?: string;

  @Column({ type: "longtext" })
  content!: string;

  @Column({ default: true })
  published!: boolean;

  @ManyToOne(() => User, (u) => u.articles, { eager: true })
  author!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}