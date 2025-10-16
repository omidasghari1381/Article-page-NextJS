import { Repository } from "typeorm";
import { getDataSource } from "@/server/db/typeorm.datasource";
import { Redirect } from "../entities/redirect.entity";
import { RedirectStatus } from "../enums/RedirectStatus.enum";
import type {
  CreateRedirectDto,
  ListRedirectsQuery,
  UpdateRedirectDto,
} from "../types/service.type";
import { escapeLike } from "@/server/core/utils/escapeLike";

export type RedirectDTO = {
  id: string;
  fromPath: string;
  toPath: string;
  statusCode: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

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

  private toDTO(ent: Redirect): RedirectDTO {
    return {
      id: ent.id,
      fromPath: ent.fromPath,
      toPath: ent.toPath,
      statusCode: ent.statusCode,
      isActive: !!ent.isActive,
      createdAt: ent.createdAt ? ent.createdAt.toISOString() : undefined,
      updatedAt: ent.updatedAt ? ent.updatedAt.toISOString() : undefined,
    };
  }

  async create(dto: CreateRedirectDto): Promise<RedirectDTO> {
    const repo = await this.repo();
    const ent = repo.create({
      fromPath: dto.fromPath.trim(),
      toPath: dto.toPath.trim(),
      statusCode: dto.statusCode ?? RedirectStatus.M301,
      isActive: dto.isActive ?? true,
    });
    const saved = await repo.save(ent);
    return this.toDTO(saved);
  }

  async getById(id: string): Promise<RedirectDTO | null> {
    const repo = await this.repo();
    const ent = await repo.findOne({ where: { id } });
    return ent ? this.toDTO(ent) : null;
  }

  async list(query: ListRedirectsQuery = {}) {
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

    if (typeof isActive === "boolean")
      qb.andWhere("r.isActive = :isActive", { isActive });

    if (Array.isArray(statusCode) && statusCode.length) {
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

    const sortMap: Record<string, string> = {
      createdAt: "r.createdAt",
      updatedAt: "r.updatedAt",
      fromPath: "r.fromPath",
      toPath: "r.toPath",
      statusCode: "r.statusCode",
      isActive: "r.isActive",
    };
    qb.orderBy(
      sortMap[sortBy] ?? "r.createdAt",
      sortDir === "ASC" ? "ASC" : "DESC"
    );

    const take = Math.max(1, Math.min(100, pageSize || 20));
    const currentPage = Math.max(1, page || 1);
    const skip = (currentPage - 1) * take;

    qb.take(take).skip(skip);

    const [rows, total] = await qb.getManyAndCount();
    return {
      items: rows.map((r) => this.toDTO(r)),
      total,
      page: currentPage,
      pageSize: take,
      pages: Math.max(1, Math.ceil(total / take)),
    };
  }

  async update(
    id: string,
    dto: UpdateRedirectDto
  ): Promise<RedirectDTO | null> {
    const repo = await this.repo();
    const ent = await repo.findOne({ where: { id } });
    if (!ent) return null;

    if (Object.prototype.hasOwnProperty.call(dto, "fromPath"))
      ent.fromPath = dto.fromPath?.trim() ?? ent.fromPath;
    if (Object.prototype.hasOwnProperty.call(dto, "toPath"))
      ent.toPath = dto.toPath?.trim() ?? ent.toPath;
    if (
      Object.prototype.hasOwnProperty.call(dto, "statusCode") &&
      dto.statusCode !== undefined
    )
      ent.statusCode = dto.statusCode;
    if (
      Object.prototype.hasOwnProperty.call(dto, "isActive") &&
      dto.isActive !== undefined
    )
      ent.isActive = dto.isActive;

    const saved = await repo.save(ent);
    return this.toDTO(saved);
  }

  async toggleActive(id: string, next: boolean): Promise<RedirectDTO | null> {
    return this.update(id, { isActive: next });
  }

  async remove(id: string): Promise<boolean> {
    const repo = await this.repo();
    const res = await repo.delete(id);
    return (res.affected ?? 0) > 0;
  }
}
