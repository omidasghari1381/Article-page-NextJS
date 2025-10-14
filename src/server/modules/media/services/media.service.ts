import { Repository } from "typeorm";
import z from "zod";
import path from "path";
import { promises as fsp } from "node:fs";

import { getDataSource } from "@/server/db/typeorm.datasource";
import { MediaItem } from "../entities/mediaItem.entity";
import { SimpleMediaType } from "../enums/media.enums";
import { sortOptionEnum } from "../enums/SortOption.enum";

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

type SortOption = sortOptionEnum;

export class MediaService {
  private repoP: Promise<Repository<MediaItem>>;

  constructor() {
    this.repoP = (async () => {
      const ds = await getDataSource();
      return ds.getRepository(MediaItem);
    })();
  }
  private async repo() {
    return this.repoP;
  }

  async listMedia(params?: {
    q?: string;
    type?: SimpleMediaType;
    types?: SimpleMediaType[];
    sort?: SortOption;
    createdFrom?: Date | string;
    createdTo?: Date | string;
    limit?: number;
    offset?: number;
  }) {
    const repo = await this.repo();

    const limit = Math.min(Math.max(params?.limit ?? 24, 1), 100);
    const offset = Math.max(params?.offset ?? 0, 0);

    const qb = repo.createQueryBuilder("m");

    if (params?.q && params.q.trim().length > 0) {
      const words = params.q.trim().split(/\s+/).filter(Boolean);
      words.forEach((w, i) => {
        const key = `q${i}`;
        const like = `%${w}%`;
        qb.andWhere(`(m.name LIKE :${key} OR m.description LIKE :${key})`, {
          [key]: like,
        });
      });
    }

    if (params?.types && params.types.length > 0) {
      qb.andWhere("m.type IN (:...types)", { types: params.types });
    } else if (params?.type) {
      qb.andWhere("m.type = :type", { type: params.type });
    }

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

    const sort: SortOption = params?.sort ?? sortOptionEnum.newest;
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

  async getMediaById(id: string) {
    const repo = await this.repo();
    return repo.findOne({ where: { id } });
  }

  async createMedia(input: CreateMediaInputType) {
    CreateMediaInput.parse(input);
    const repo = await this.repo();

    const url = input.url.trim();
    const urlExists = await repo.exists({ where: { url } });
    if (urlExists) throw new Error("این آدرس قبلاً ثبت شده است");

    const entity = repo.create({
      name: input.name.trim(),
      description: input.description ?? null,
      url,
      type: input.type,
    });

    const saved = await repo.save(entity);
    return saved;
  }

  async updateMedia(id: string, updates: UpdateMediaInputType) {
    UpdateMediaInput.parse(updates);
    const repo = await this.repo();

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

  async deleteMedia(id: string) {
    const repo = await this.repo();

    const item = await repo.findOne({ where: { id } });
    if (!item) throw new Error("Media not found");

    const fileUrl = item.url;
    await repo.delete(id);

    if (fileUrl && fileUrl.startsWith("/uploads/")) {
      const abs = path.join(
        process.cwd(),
        "public",
        fileUrl.replace(/^\/+/, "")
      );
      await fsp.unlink(abs).catch(() => {});
    }

    return { ok: true };
  }
}
