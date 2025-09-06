import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Article } from "./Article";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "varchar",
    unique: true,
  })
  email!: string;

  @Column({
    type: "varchar",
    length: 30,
    nullable: false,
    unique: true,
  })
  firstname!: string;

  @Column({
    type: "varchar",
    nullable: false,
    length: 60,
  })
  surname!: string;

  @Column()
  passwordHash!: string;

  @Column({
    type: "varchar",
    unique: true,
    nullable: false,
    length: 11,
  })
  phone!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Article, (a) => a.author)
  articles!: Article[];
}
