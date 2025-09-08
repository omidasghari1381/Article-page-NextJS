import { DataSource } from "typeorm";
import { Article } from "@/server/modules/articles/entities/article.entity";
import { User } from "../modules/users/entities/user.entity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Article, User],
  synchronize: true,
});
