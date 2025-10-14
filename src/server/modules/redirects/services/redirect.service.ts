// src/server/modules/redirects/services/redirect.service.ts
import { Repository } from "typeorm";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { RedirectStatus } from "../enums/RedirectStatus.enum";
import { Redirect } from "../entities/redirect.entity";
import type {
  CreateRedirectDto,
  ListRedirectsQuery,
  UpdateRedirectDto,
} from "../types/service.type";
import { escapeLike } from "@/server/core/utils/escapeLike";

export class RedirectService {
  private repoP: Promise<Repository<Redirect>>;
  constructor() {
    this.repoP = (async () => {
      const ds = await getDataSource();
      return ds.getRepository(Redirect);
    })();
  }
  private async repo() {
    return this.repoP;
  }
  async create(dto: CreateRedirectDto) {
    const repo = await this.repo();
    const entity = repo.create({
      fromPath: dto.fromPath.trim(),
      toPath: dto.toPath.trim(),
      statusCode: dto.statusCode ?? RedirectStatus.M301,
      isActive: dto.isActive ?? true,
    });
    return await repo.save(entity);
  }
  async getOneById(id: string) {
    const repo = await this.repo();
    return await repo.findOne({ where: { id } });
  }
  async redirectList(query: ListRedirectsQuery = {}) {
    const repo = await this.repo();
    const {
      q,
      searchIn = "both",
      isActive,
      statusCode,
      createdFrom,
      createdTo,
      sortBy = "createdAt",
      sortDir = "DESC",
      page = 1,
      pageSize = 20,
    } = query;

    const qb = repo.createQueryBuilder("r");

    if (typeof isActive === "boolean") {
      qb.andWhere("r.isActive = :isActive", { isActive });
    }

    if (Array.isArray(statusCode) && statusCode.length > 0) {
      qb.andWhere("r.statusCode IN (:...codes)", { codes: statusCode });
    } else if (typeof statusCode === "number") {
      qb.andWhere("r.statusCode = :code", { code: statusCode });
    }

    if (createdFrom)
      qb.andWhere("r.createdAt >= :createdFrom", { createdFrom });
    if (createdTo) qb.andWhere("r.createdAt < :createdTo", { createdTo });

    if (q && q.trim()) {
      const pattern = `%${escapeLike(q.trim())}%`;
      if (searchIn === "fromPath") {
        qb.andWhere("LOWER(r.fromPath) LIKE LOWER(:pattern) ESCAPE '\\'", {
          pattern,
        });
      } else if (searchIn === "toPath") {
        qb.andWhere("LOWER(r.toPath) LIKE LOWER(:pattern) ESCAPE '\\'", {
          pattern,
        });
      } else {
        qb.andWhere(
          "(LOWER(r.fromPath) LIKE LOWER(:pattern) ESCAPE '\\' OR LOWER(r.toPath) LIKE LOWER(:pattern) ESCAPE '\\')",
          { pattern }
        );
      }
    }

    const SORTABLE: Record<
      NonNullable<ListRedirectsQuery["sortBy"]>,
      string
    > = {
      createdAt: "r.createdAt",
      updatedAt: "r.updatedAt",
      fromPath: "r.fromPath",
      toPath: "r.toPath",
      statusCode: "r.statusCode",
      isActive: "r.isActive",
    };
    const col = SORTABLE[sortBy] ?? SORTABLE.createdAt;

    qb.orderBy(col, sortDir === "ASC" ? "ASC" : "DESC")
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      page,
      pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }
  async update(id: string, dto: UpdateRedirectDto) {
    const repo = await this.repo();
    const entity = await repo.findOne({ where: { id } });
    if (!entity) return null;
    if (dto.fromPath !== undefined) entity.fromPath = dto.fromPath.trim();
    if (dto.toPath !== undefined) entity.toPath = dto.toPath.trim();
    if (dto.statusCode !== undefined) entity.statusCode = dto.statusCode;
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;
    return await repo.save(entity);
  }
  async remove(id: string) {
    const repo = await this.repo();
    const result = await repo.delete(id);
    return result.affected === 1;
  }
}
