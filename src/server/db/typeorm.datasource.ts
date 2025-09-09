import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "@/server/modules/users/entities/user.entity";
import { Article } from "@/server/modules/articles/entities/article.entity";
import { ENTITIES } from "./entities";

let ds: DataSource | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (ds?.isInitialized) return ds;

  ds = new DataSource({
    type: "mysql", 
    url: process.env.DATABASE_URL ?? undefined,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [...ENTITIES], // مهم: فقط از یک مرجع
    synchronize: true, 
    logging: false,
  });

  if (!ds.isInitialized) {
    await ds.initialize();
  }
  return ds;
}