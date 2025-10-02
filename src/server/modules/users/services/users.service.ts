import { DataSource, Repository, In } from "typeorm";
import type { userRoleEnum } from "../enums/userRoleEnum";
import { User } from "../entities/user.entity";
import type { getUserEnum } from "../enums/sortUserBy.enum";

export type UpdateUserDto = Partial<{
  firstName: string;
  lastName: string;
  phone: string;
  passwordHash: string;
  role: userRoleEnum;
}>;

export type ListUserQuery = {
  q?: string;
  role?: userRoleEnum | userRoleEnum[];
  createdFrom?: Date;
  createdTo?: Date;
  sortBy?: getUserEnum;
  sortDir?: "ASC" | "DESC";
  page?: number;
  pageSize?: number;
};

export class UserService {
  private repo: Repository<User>;
  constructor(private readonly ds: DataSource) {
    this.repo = this.ds.getRepository(User);
  }

  async getOneById(id: string) {
    return await this.repo.findOne({ where: { id } });
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
    } = query;

    // فقط ستون‌های مجاز برای مرتب‌سازی
    const sortableColumns = new Set([
      "createdAt",
      "firstName",
      "lastName",
      "phone",
      "role",
      "updatedAt",
    ]);
    const sortColumn = sortableColumns.has(String(sortBy))
      ? String(sortBy)
      : "createdAt";

    const qb = this.repo
      .createQueryBuilder("u")
      .orderBy(`u.${sortColumn}`, sortDir)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    // فیلتر نقش (تکی یا آرایه)
    if (Array.isArray(role) && role.length > 0) {
      qb.andWhere("u.role IN (:...roles)", { roles: role });
    } else if (typeof role !== "undefined") {
      qb.andWhere("u.role = :role", { role });
    }

    // جست‌وجوی متنی روی firstName / lastName / phone
    if (q && q.trim()) {
      const like = `%${q.trim()}%`;
      // ILIKE برای Postgres؛ در سایر درایورها LIKE رفتار حروف‌کوچک/بزرگ متفاوت دارد
      qb.andWhere(
        "(u.firstName ILIKE :like OR u.lastName ILIKE :like OR u.phone ILIKE :like)",
        { like }
      );
    }

    // محدوده‌ی تاریخ ایجاد
    if (createdFrom)
      qb.andWhere("u.createdAt >= :createdFrom", { createdFrom });
    if (createdTo) qb.andWhere("u.createdAt < :createdTo", { createdTo });

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize,
      pages: Math.ceil(total / pageSize),
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;

    if (dto.firstName !== undefined) entity.firstName = dto.firstName.trim();
    if (dto.lastName !== undefined) entity.lastName = dto.lastName.trim();
    if (dto.phone !== undefined) entity.phone = dto.phone.trim();
    if (dto.role !== undefined) entity.role = dto.role;
    if (dto.passwordHash !== undefined) entity.passwordHash = dto.passwordHash;

    return await this.repo.save(entity);
  }

  async remove(id: string) {
    const result = await this.repo.delete(id);
    return result.affected === 1;
  }
}
