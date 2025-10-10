import { DataSource, Repository, In } from "typeorm";
import { User } from "../entities/user.entity";
import type { ListUserQuery, UpdateUserDto } from "../types/service.type";

export class UserService {
  private repo: Repository<User>;
  constructor(private readonly ds: DataSource) {
    this.repo = this.ds.getRepository(User);
  }

  async getOneById(id: string, opts?: { withDeleted?: boolean }) {
    return this.repo.findOne({
      where: { id },
      withDeleted: !!opts?.withDeleted, 
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

    qb.orderBy(`u.${sortBy}`, sortDir)
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
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
    await this.repo.update(id, { isDeleted: 1 as 1 });
    const res = await this.repo.softDelete(id);
    return res.affected === 1;
  }

  async restore(id: string) {
    const res = await this.repo.restore(id);
    if (res.affected === 1) {
      await this.repo.update(id, { isDeleted: 0 as 0 });
      return true;
    }
    return false;
  }
}
