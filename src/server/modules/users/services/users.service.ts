import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import type { ListUserQuery, UpdateUserDto } from "../types/service.type";
import { getDataSource } from "@/server/db/typeorm.datasource";

export type UserDTO = {
  id: string;
  firstName: string;
  lastName: string;
  role: string | number;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: number;
};

export class UserService {
  private repoP: Promise<Repository<User>>;

  constructor() {
    this.repoP = (async () => {
      const ds = await getDataSource();
      return ds.getRepository(User);
    })();
  }

  private async repo() {
    return this.repoP;
  }

  private static parseBool(input: unknown): boolean | undefined {
    if (input === undefined || input === null) return undefined;
    if (typeof input === "boolean") return input;
    if (typeof input === "number") return input === 1;
    const s = String(input).trim().toLowerCase();
    if (s === "1" || s === "true") return true;
    if (s === "0" || s === "false") return false;
    return undefined;
  }

  private toDTO(u: User): UserDTO {
    return {
      id: String(u.id),
      firstName: u.firstName ?? "",
      lastName: u.lastName ?? "",
      role: (u as any).role,
      phone: u.phone ?? "",
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : undefined,
      updatedAt: u.updatedAt ? new Date(u.updatedAt).toISOString() : undefined,
      isDeleted:
        typeof (u as any).isDeleted === "number"
          ? (u as any).isDeleted
          : (u as any).isDeleted
          ? 1
          : 0,
    };
  }

  async getOneById(id: string, opts?: { withDeleted?: boolean }) {
    const repo = await this.repo();
    return repo.findOne({ where: { id }, withDeleted: !!opts?.withDeleted });
  }

  async getOneByIdDTO(
    id: string,
    opts?: { withDeleted?: boolean }
  ): Promise<UserDTO | null> {
    const ent = await this.getOneById(id, opts);
    return ent ? this.toDTO(ent) : null;
  }

  async userList(query: ListUserQuery = {}) {
    const repo = await this.repo();

    const {
      q,
      role,
      createdFrom,
      createdTo,
      sortBy = "createdAt",
      sortDir = "DESC",
      page = 1,
      pageSize = 20,
      withDeleted = false,
      deletedOnly = false,
    } = query;

    const qb = repo.createQueryBuilder("u");

    if (withDeleted || deletedOnly) qb.withDeleted();

    if (deletedOnly) {
      qb.andWhere("(u.deletedAt IS NOT NULL OR u.isDeleted = 1)");
    } else if (!withDeleted) {
      qb.andWhere(
        "(u.deletedAt IS NULL AND (u.isDeleted = 0 OR u.isDeleted IS NULL))"
      );
    }

    if (q) {
      qb.andWhere(
        "(u.firstName LIKE :qq OR u.lastName LIKE :qq OR u.phone LIKE :qq)",
        { qq: `%${q}%` }
      );
    }

    if (role) {
      if (Array.isArray(role))
        qb.andWhere("u.role IN (:...roles)", { roles: role });
      else qb.andWhere("u.role = :role", { role });
    }

    if (createdFrom) qb.andWhere("u.createdAt >= :from", { from: createdFrom });
    if (createdTo) qb.andWhere("u.createdAt <= :to", { to: createdTo });

    qb.orderBy(
      `u.${sortBy}`,
      (sortDir === "ASC" ? "ASC" : "DESC") as "ASC" | "DESC"
    )
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    const plainItems = items.map((u) => this.toDTO(u));

    return {
      items: plainItems,
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    const repo = await this.repo();
    const entity = await repo.findOne({ where: { id } });
    if (!entity) return null;

    if (dto.firstName !== undefined) entity.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) entity.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) entity.phone = dto.phone.trim();
    if (dto.role !== undefined) entity.role = dto.role;
    if (dto.passwordHash !== undefined) entity.passwordHash = dto.passwordHash;

    const saved = await repo.save(entity);
    return this.toDTO(saved);
  }

  async remove(id: string) {
    const repo = await this.repo();
    await repo.update(id, { isDeleted: 1 as 1 });
    const res = await repo.softDelete(id);
    return res.affected === 1;
  }

  async restore(id: string) {
    const repo = await this.repo();
    const res = await repo.restore(id);
    if (res.affected === 1) {
      await repo.update(id, { isDeleted: 0 as 0 });
      return true;
    }
    return false;
  }

  async getUserCount(q: {
    role?: string | string[];
    isDeleted?: unknown;
  }): Promise<number> {
    try {
      const repo = await this.repo();
      const qb = repo.createQueryBuilder("u");
      if (Array.isArray(q.role) && q.role.length) {
        qb.andWhere("u.role IN (:...roles)", { roles: q.role });
      } else if (q.role) {
        qb.andWhere("u.role = :role", { role: q.role });
      }
      const isDel = UserService.parseBool(q.isDeleted);
      if (isDel !== undefined) {
        qb.andWhere("u.isDeleted = :isDeleted", { isDeleted: isDel ? 1 : 0 });
      }
      const count = await qb.getCount();
      return count;
    } catch (err) {
      throw { status: 500, message: "Failed to get user count", err };
    }
  }
}
