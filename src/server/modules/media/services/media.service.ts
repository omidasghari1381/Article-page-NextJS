import { DataSource } from "typeorm";
import z from "zod";
import { MediaItem } from "../entities/mediaItem.entity";
import { SimpleMediaType } from "../enums/media.enums";

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

export class MediaService {
  constructor(private ds: DataSource) {}

  async listMedia(params?: {
    q?: string; 
    type?: SimpleMediaType; 
    limit?: number;
    offset?: number;
  }) {
    const repo = this.ds.getRepository(MediaItem);
    const limit = Math.min(Math.max(params?.limit ?? 50, 1), 100);
    const offset = Math.max(params?.offset ?? 0, 0);

    const qb = repo.createQueryBuilder("m");

    if (params?.q) {
      const q = `%${params.q}%`;
      qb.andWhere("(m.name LIKE :q OR m.description LIKE :q)", { q });
      // اگر از MySQL با collation غیر حساس به حروف استفاده می‌کنی، همین بس است
      // اگر Postgres بودی می‌توانستی از ILike استفاده کنی
    }

    if (params?.type) {
      qb.andWhere("m.type = :type", { type: params.type });
    }

    qb.orderBy("m.createdAt", "DESC").skip(offset).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, limit, offset };
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

    await repo.remove(item);
    return { ok: true };
  }
}
