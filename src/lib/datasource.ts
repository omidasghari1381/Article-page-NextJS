import { Article } from "@/entities/Article";
import { Faq } from "@/entities/Faq";
import { User } from "@/entities/User";
import "reflect-metadata";
import { DataSource } from "typeorm";

declare global {
  // برای HMR در dev
  // eslint-disable-next-line no-var
  var _ds: DataSource | undefined;
}

export const AppDataSource =
  global._ds ??
  new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User, Article, Faq],
    synchronize: true, 
    logging: ["error"],
    charset: "utf8mb4",
  });

if (process.env.NODE_ENV !== "production") global._ds = AppDataSource;

export async function getDS() {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  return AppDataSource;
}
