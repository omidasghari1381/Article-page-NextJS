import { DataSource, type FindOptionsWhere, ILike, Repository } from "typeorm";
import { RedirectStatus } from "../enums/RedirectStatus.enum";
import { Redirect } from "../entities/redirect.entity";
import type { getRedirectEnum } from "../enums/getRedirect.enum";

export type UpdateRedirectDto = Partial<{
  fromPath: string;
  toPath: string;
  statusCode: RedirectStatus;
  isActive: boolean;
}>;

export type ListRedirectsQuery = {
  q?: string;
  isActive?: boolean;
  statusCode?: RedirectStatus | RedirectStatus[];
  createdFrom?: Date;
  createdTo?: Date;
  sortBy?: getRedirectEnum;
  sortDir?: "ASC" | "DESC";
  page?: number;
  pageSize?: number;
};

export type CreateRedirectDto = {
  fromPath: string;
  toPath: string;
  statusCode?: RedirectStatus;
  isActive?: boolean;
};

export class RedirectService {
  private repo: Repository<Redirect>;
  constructor(private readonly ds: DataSource) {
    this.repo = this.ds.getRepository(Redirect);
  }

  async create(dto: CreateRedirectDto) {
    const entity = this.repo.create({
      fromPath: dto.fromPath.trim(),
      toPath: dto.toPath.trim(),
      statusCode: dto.statusCode ?? RedirectStatus.M301,
      isActive: dto.isActive ?? true,
    });
    return await this.repo.save(entity);
  }

  async getOneById(id: string) {
    return await this.repo.findOne({ where: { id } });
  }
  
  async getOneByFromPath(fromPath: string) {
    return await this.repo.findOne({ where: { fromPath } });
  }

  async list(query: ListRedirectsQuery = {}) {
    const {
      q,
      isActive,
      statusCode,
      createdFrom,
      createdTo,
      sortBy = "createdAt",
      sortDir = "DESC",
      page = 1,
      pageSize = 20,
    } = query;

    const where: FindOptionsWhere<Redirect>[] = [];

    const base: FindOptionsWhere<Redirect> = {};

    if (typeof isActive === "boolean") base.isActive = isActive;

    if (Array.isArray(statusCode) && statusCode.length > 0) {
      where.push({ ...base, statusCode: statusCode[0] });
      for (let i = 1; i < statusCode.length; i++) {
        where.push({ ...base, statusCode: statusCode[i] });
      }
    } else if (typeof statusCode === "number") {
      base.statusCode = statusCode;
    }

    if (q && q.trim()) {
      const like = ILike(`%${q.trim()}%`);
      if (where.length > 0) {
        for (const w of where) {
          (w as any).fromPath = like;
        }
        const clones = where.map((w) => ({ ...w, toPath: like }));
        where.push(...clones);
      } else {
        where.push({ ...base, fromPath: like });
        where.push({ ...base, toPath: like });
      }
    } else if (where.length === 0) {
      where.push(base);
    }

    const qb = this.repo
      .createQueryBuilder("r")
      .where(where.length === 1 ? where[0] : where)
      .orderBy(`r.${sortBy}`, sortDir)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (createdFrom)
      qb.andWhere("r.createdAt >= :createdFrom", { createdFrom });
    if (createdTo) qb.andWhere("r.createdAt < :createdTo", { createdTo });

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
    };
  }

  async update(id: string, dto: UpdateRedirectDto) {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;

    if (dto.fromPath !== undefined) entity.fromPath = dto.fromPath.trim();
    if (dto.toPath !== undefined) entity.toPath = dto.toPath.trim();
    if (dto.statusCode !== undefined) entity.statusCode = dto.statusCode;
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;

    return await this.repo.save(entity);
  }

  async remove(id: string) {
    const result = await this.repo.delete(id);
    return result.affected === 1;
  }

  // اختیاری: upsert براساس fromPath (کارآمد برای سینک فایل/CSV)
  async upsertByFromPath(dto: CreateRedirectDto) {
    const existing = await this.getOneByFromPath(dto.fromPath);
    if (existing) {
      return this.update(existing.id, dto);
    }
    return this.create(dto);
  }
}
