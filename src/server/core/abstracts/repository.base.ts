// import { DataSource, type QueryRunner, Repository } from 'typeorm';
// import type {
//   DeepPartial,
//   FindManyOptions,
//   FindOneOptions,
//   FindOptionsWhere,
//   InsertResult,
//   UpdateResult,
// } from 'typeorm';
// import type { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import {
  DataSource,
  type QueryRunner,
  Repository,
  InsertResult,
  UpdateResult,
} from "typeorm";
import type {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  ObjectLiteral,
} from "typeorm";
type RepoUpdateParam<T extends ObjectLiteral> = Parameters<Repository<T>["update"]>[1];
type RepoUpsertParam<T extends ObjectLiteral> = Parameters<Repository<T>["upsert"]>[0];

import { AbstractEntity } from "./entity.base";

type Plain<T> = Record<string, any>;
type Criteria<TEntity> =
  | string
  | number
  | Date
  | FindOptionsWhere<TEntity>
  | FindOptionsWhere<TEntity>[];

class NotFoundException extends Error {
  status = 404;
  constructor(message = "Document not found") {
    super(message);
    this.name = "NotFoundException";
  }
}

export abstract class AbstractRepository<TEntity extends AbstractEntity> {
  protected readonly logger: Pick<Console, "warn"> = console;

  constructor(
    protected readonly repo: Repository<TEntity>,
    protected readonly dataSource: DataSource
  ) {}

  async create(data: DeepPartial<TEntity>): Promise<TEntity> {
    const entity = this.repo.create(data);
    return await this.repo.save(entity);
  }

  async findOne(options: FindOneOptions<TEntity>): Promise<Plain<TEntity>> {
    const entity = await this.repo.findOne({ ...options });
    if (!entity) {
      this.logger.warn("Document not found with options", options);
      throw new NotFoundException("Document not found");
    }
    return entity as Plain<TEntity>;
  }

  async find(options?: FindManyOptions<TEntity>): Promise<Plain<TEntity>[]> {
    const rows = await this.repo.find({ ...options });
    return rows as Plain<TEntity>[];
  }

  async findOneAndUpdate(
    findOptions: FindOneOptions<TEntity>,
    patch: DeepPartial<TEntity>
  ): Promise<Plain<TEntity>> {
    const entity = await this.repo.findOne(findOptions);
    if (!entity) {
      this.logger.warn("Document not found with options", findOptions);
      throw new NotFoundException("Document not found");
    }
    const merged = this.repo.merge(entity, patch);
    const saved = await this.repo.save(merged);
    return saved as Plain<TEntity>;
  }

  // async upsert(
  //   rows: QueryDeepPartialEntity<TEntity> | QueryDeepPartialEntity<TEntity>[],
  //   conflictPaths: (keyof TEntity)[],
  // ): Promise<InsertResult> {
  //   const list = Array.isArray(rows) ? rows : [rows];
  //   return this.repo.upsert(list, {
  //     conflictPaths: conflictPaths.map(String),
  //     skipUpdateIfNoValuesChanged: true,
  //   });
  // }
  async upsert(
    rows: RepoUpsertParam<TEntity>, 
    conflictPaths: (keyof TEntity)[]
  ): Promise<InsertResult> {
    const list = Array.isArray(rows) ? rows : [rows];
    return this.repo.upsert(list as any, {
      conflictPaths: conflictPaths.map(String),
      skipUpdateIfNoValuesChanged: true,
    });
  }
  // async updateOne(
  //   criteria: Criteria<TEntity>,
  //   data: QueryDeepPartialEntity<TEntity>,
  // ): Promise<UpdateResult> {
  //   return this.repo.update(criteria as any, data);
  // }
  async updateOne(
    criteria: Criteria<TEntity>,
    data: RepoUpdateParam<TEntity> // قبلاً QueryDeepPartialEntity<TEntity>
  ): Promise<UpdateResult> {
    return this.repo.update(criteria as any, data);
  }
  async deleteAll(
    where:
      | FindOptionsWhere<TEntity>
      | FindOptionsWhere<TEntity>[]
      | string
      | number
      | Date
  ): Promise<number> {
    const res = await this.repo.delete(where as any);
    return res.affected ?? 0;
  }

  async softDeleteAll(
    where: FindOptionsWhere<TEntity> | FindOptionsWhere<TEntity>[]
  ): Promise<number> {
    const res = await this.repo.softDelete(where as any);
    return res.affected ?? 0;
  }

  async startTransaction(): Promise<QueryRunner> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    return qr;
  }

  async commitAndRelease(qr: QueryRunner) {
    try {
      await qr.commitTransaction();
    } finally {
      await qr.release();
    }
  }

  async rollbackAndRelease(qr: QueryRunner) {
    try {
      await qr.rollbackTransaction();
    } finally {
      await qr.release();
    }
  }
}
