// ✅ src/server/modules/users/services/users.service.ts (فقط بخش‌های مهم)
import { DataSource, Repository } from "typeorm";
import { User } from "../entities/user.entity";
import type { getUserEnum } from "@/server/modules/users/enums/sortUserBy.enum";
import type { userRoleEnum } from "@/server/modules/users/enums/userRoleEnum";

export type ListUserQuery = {
  q?: string;
  role?: userRoleEnum | userRoleEnum[];
  createdFrom?: Date;
  createdTo?: Date;
  sortBy?: getUserEnum;
  sortDir?: "ASC" | "DESC";
  page?: number;
  pageSize?: number;
  withDeleted?: boolean;   // 👈 اضافه شد
  deletedOnly?: boolean;   // 👈 اضافه شد
};

export class UserService {
  private repo: Repository<User>;
  constructor(private readonly ds: DataSource) {
    this.repo = this.ds.getRepository(User);
  }

  async getOneById(id: string, opts?: { withDeleted?: boolean }) {
    return this.repo.findOne({
      where: { id },
      withDeleted: !!opts?.withDeleted, // 👈 اگر لازم شد
    });
  }

  async list(query: ListUserQuery = {}) {
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

    const qb = this.repo.createQueryBuilder("u");

    // 👇 کنترل soft delete
    if (withDeleted || deletedOnly) qb.withDeleted();

    if (deletedOnly) {
      // اگر از فلگ isDeleted استفاده می‌کنی:
      qb.andWhere("(u.deletedAt IS NOT NULL OR u.isDeleted = 1)");
    } else if (!withDeleted) {
      // فقط اکتیوها
      qb.andWhere("(u.deletedAt IS NULL AND (u.isDeleted = 0 OR u.isDeleted IS NULL))");
    }

    if (q) {
      qb.andWhere("(u.firstName LIKE :qq OR u.lastName LIKE :qq OR u.phone LIKE :qq)", { qq: `%${q}%` });
    }

    if (role) {
      if (Array.isArray(role)) qb.andWhere("u.role IN (:...roles)", { roles: role });
      else qb.andWhere("u.role = :role", { role });
    }

    if (createdFrom) qb.andWhere("u.createdAt >= :from", { from: createdFrom });
    if (createdTo) qb.andWhere("u.createdAt <= :to", { to: createdTo });

    qb.orderBy(`u.${sortBy}`, sortDir)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
  }
}
