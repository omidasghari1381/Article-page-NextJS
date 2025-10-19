import "reflect-metadata";
import { DataSource } from "typeorm";
import { ENTITIES } from "./entities";

let _ds: DataSource | null = null;
let _initing: Promise<DataSource> | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (_ds?.isInitialized) return _ds;
  if (_initing) return _initing;
  _initing = (async () => {
    const ds = new DataSource({
      type: "mysql",
      url: process.env.DATABASE_URL ?? undefined,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: ENTITIES,
      synchronize: true,
      logging: false,
    });

    if (!ds.isInitialized) await ds.initialize();
    _ds = ds;
    return ds;
  })();

  return _initing;
}
