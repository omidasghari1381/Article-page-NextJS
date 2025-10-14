// services/redirect.service.ts (یا هرجا که هست)
import { FindOptionsWhere } from "typeorm";
import { Redirect } from "./redirect.entity"; // مسیر صحیح entity
// ...

type ListRedirectsQuery = {
  q?: string;
  isActive?: boolean;
  statusCode?: number | number[];
  createdFrom?: Date | string;
  createdTo?: Date | string;
  sortBy?: "createdAt" | "updatedAt" | "fromPath" | "toPath" | "statusCode" | "isActive";
  sortDir?: "ASC" | "DESC";
  page?: number;
  pageSize?: number;
};

function escapeLike(s: string) {
  return s.replace(/([\\%_])/g, "\\$1");
}

export class RedirectService {
  // فرض: this.repo() ریپازیتوری Redirect رو برمی‌گردونه
  private async repo() { /* ... */ }

  async redirectList(query: ListRedirectsQuery = {}) {
    const repo = await this.repo();

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

    const qb = repo.createQueryBuilder("r");

    // فیلترهای ساده
    if (typeof isActive === "boolean") {
      qb.andWhere("r.isActive = :isActive", { isActive });
    }

    if (Array.isArray(statusCode) && statusCode.length > 0) {
      qb.andWhere("r.statusCode IN (:...codes)", { codes: statusCode });
    } else if (typeof statusCode === "number") {
      qb.andWhere("r.statusCode = :code", { code: statusCode });
    }

    // بازه تاریخ
    if (createdFrom) qb.andWhere("r.createdAt >= :createdFrom", { createdFrom });
    if (createdTo) qb.andWhere("r.createdAt < :createdTo", { createdTo });

    // جستجو ساده روی fromPath | toPath
    if (q && q.trim()) {
      const pattern = `%${escapeLike(q.trim())}%`;
      qb.andWhere(
        "(LOWER(r.fromPath) LIKE LOWER(:pattern) ESCAPE '\\' OR LOWER(r.toPath) LIKE LOWER(:pattern) ESCAPE '\\')",
        { pattern }
      );
    }

    // مرتب‌سازی سفیدلیست‌شده
    const SORTABLE: Record<NonNullable<ListRedirectsQuery["sortBy"]>, string> = {
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

  // (اختیاری) برای سازگاری؛ حالا از redirectList استفاده می‌کند
  async getOneByFromPath(fromPath: string) {
    const term = (fromPath ?? "").trim();
    if (!term) return [];
    const res = await this.redirectList({
      q: term,
      sortBy: "fromPath",
      sortDir: "ASC",
      page: 1,
      pageSize: 10,
    });
    return res.items;
  }
}
