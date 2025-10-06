import { DataSource } from "typeorm";
import z from "zod";
import { MediaItem } from "../entities/mediaItem.entity";
import { SimpleMediaType } from "../enums/media.enums";
import path from "path";
import { promises as fsp } from "node:fs";

export const CreateMediaInput = z.object({
  name: z.string().min(1).max(255),
  url: z.string().min(1).max(1000),
  type: z.enum(SimpleMediaType),
  description: z.string().nullable().optional(),
});

export type CreateMediaInputType = z.infer<typeof CreateMediaInput>;

export const UpdateMediaInput = z.object({
  name: z.string().min(1).max(255).optional(),
  url: z.string().max(1000).optional(),
  type: z.enum(SimpleMediaType).optional(),
  description: z.string().nullable().optional(),
});
export type UpdateMediaInputType = z.infer<typeof UpdateMediaInput>;
type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";

export class MediaService {
  constructor(private ds: DataSource) {}

  async listMedia(params?: {
    /** جستجو در name/description. واژه‌ها با فاصله جدا شوند (AND). */
    q?: string;
    /** فیلتر تک‌تایی نوع مدیا، برای سازگاری قدیمی */
    type?: SimpleMediaType;
    /** فیلتر چندتایی نوع مدیا (ارجح بر type) */
    types?: SimpleMediaType[];
    /** سورت نتایج */
    sort?: SortOption;
    /** فیلتر از تاریخ ساخت (inclusive) */
    createdFrom?: Date | string;
    /** فیلتر تا تاریخ ساخت (inclusive) */
    createdTo?: Date | string;
    /** صفحه‌بندی */
    limit?: number;
    offset?: number;
  }) {
    const repo = this.ds.getRepository(MediaItem);

    const limit = Math.min(Math.max(params?.limit ?? 24, 1), 100);
    const offset = Math.max(params?.offset ?? 0, 0);

    const qb = repo.createQueryBuilder("m");

    // --- Search (q) ---
    if (params?.q && params.q.trim().length > 0) {
      const words = params.q.trim().split(/\s+/).filter(Boolean);

      // هر واژه باید در name یا description وجود داشته باشد (AND)
      words.forEach((w, i) => {
        const key = `q${i}`;
        const like = `%${w}%`;
        // اگر Postgres دارید و می‌خواهید case-insensitive دقیق: از ILIKE استفاده کنید
        // qb.andWhere(`(m.name ILIKE :${key} OR m.description ILIKE :${key})`, { [key]: like });
        qb.andWhere(`(m.name LIKE :${key} OR m.description LIKE :${key})`, {
          [key]: like,
        });
      });
    }

    // --- Type filter ---
    if (params?.types && params.types.length > 0) {
      qb.andWhere("m.type IN (:...types)", { types: params.types });
    } else if (params?.type) {
      qb.andWhere("m.type = :type", { type: params.type });
    }

    // --- Date range ---
    if (params?.createdFrom) {
      qb.andWhere("m.createdAt >= :from", {
        from:
          params.createdFrom instanceof Date
            ? params.createdFrom.toISOString()
            : params.createdFrom,
      });
    }
    if (params?.createdTo) {
      qb.andWhere("m.createdAt <= :to", {
        to:
          params.createdTo instanceof Date
            ? params.createdTo.toISOString()
            : params.createdTo,
      });
    }

    // --- Sort ---
    const sort: SortOption = params?.sort ?? "newest";
    switch (sort) {
      case "oldest":
        qb.orderBy("m.createdAt", "ASC");
        break;
      case "name_asc":
        qb.orderBy("m.name", "ASC").addOrderBy("m.createdAt", "DESC");
        break;
      case "name_desc":
        qb.orderBy("m.name", "DESC").addOrderBy("m.createdAt", "DESC");
        break;
      case "newest":
      default:
        qb.orderBy("m.createdAt", "DESC");
        break;
    }

    qb.skip(offset).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      items,
      total,
      limit,
      offset,
      page: Math.floor(offset / limit) + 1,
      hasMore: offset + items.length < total,
      sort,
      applied: {
        q: params?.q ?? null,
        type: params?.type ?? null,
        types: params?.types ?? null,
        createdFrom: params?.createdFrom ?? null,
        createdTo: params?.createdTo ?? null,
      },
    };
  }

  /** دریافت یک مدیا با id */
  async getMediaById(id: string) {
    const repo = this.ds.getRepository(MediaItem);
    const item = await repo.findOne({ where: { id } });
    return item;
  }

  /** ایجاد مدیا (با جلوگیری از ثبت URL تکراری) */
  async createMedia(input: CreateMediaInputType) {
    // اگر در لایه API اعتبارسنجی می‌کنی، این خط لازم نیست:
    CreateMediaInput.parse(input);

    const repo = this.ds.getRepository(MediaItem);

    // جلوگیری از URL تکراری (اختیاری اما توصیه‌شده)
    const urlExists = await repo.exists({ where: { url: input.url.trim() } });
    if (urlExists) throw new Error("این آدرس قبلاً ثبت شده است");

    const entity = repo.create({
      name: input.name.trim(),
      description: input.description ?? null,
      url: input.url.trim(),
      type: input.type,
    });

    const saved = await repo.save(entity);
    return saved;
  }

  /** بروزرسانی مدیا (نام، توضیح، نوع، URL با چک تکراری) */
  async updateMedia(id: string, updates: UpdateMediaInputType) {
    // اگر در لایه API اعتبارسنجی می‌کنی، این خط لازم نیست:
    UpdateMediaInput.parse(updates);

    const repo = this.ds.getRepository(MediaItem);
    const item = await repo.findOne({ where: { id } });
    if (!item) throw new Error("Media not found");

    if (updates.url) {
      const nextUrl = updates.url.trim();
      if (nextUrl !== item.url) {
        const exists = await repo.exists({ where: { url: nextUrl } });
        if (exists) throw new Error("این آدرس قبلاً ثبت شده است");
        item.url = nextUrl;
      }
    }

    if (updates.name !== undefined) item.name = updates.name.trim();
    if (updates.description !== undefined)
      item.description = updates.description ?? null;
    if (updates.type !== undefined) item.type = updates.type;

    await repo.save(item);

    const fresh = await repo.findOne({ where: { id: item.id } });
    return fresh!;
  }

  /** حذف مدیا */
  async deleteMedia(id: string) {
    const repo = this.ds.getRepository(MediaItem);
    const item = await repo.findOne({ where: { id } });
    if (!item) throw new Error("Media not found");
    console.log(item)
    // مسیر فایل قبل از حذف DB
    const fileUrl = item.url;

    // حذف رکورد (delete مستقیم کفایت می‌کنه)
    await repo.delete(id);

    // اگر فایل لوکالِ پروژه‌ست (نه CDN)، پاکش کن
    if (fileUrl && fileUrl.startsWith("/uploads/")) {
      const abs = path.join(
        process.cwd(),
        "public",
        fileUrl.replace(/^\/+/, "")
      );
      // تلاش برای حذف فایل؛ خطاش رو ننداز بیرون
      await fsp.unlink(abs).catch(() => {});
    }

    return { ok: true };
  }
}
