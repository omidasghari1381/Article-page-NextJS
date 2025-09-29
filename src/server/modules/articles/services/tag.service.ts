import type { DataSource } from "typeorm";
import { ArticleTag } from "../entities/articleTages.entity";

export class TagsService {
  constructor(private ds: DataSource) {}
  async createTag(input: {
    name: string;
    slug: string;
    description?: string | null;
  }) {
    const repo = this.ds.getRepository(ArticleTag);

    const cat = repo.create({
      name: input.name.trim(),
      slug: input.slug.trim().toLowerCase(),
      description: input.description ?? null,
    });

    return await repo.save(cat);
  }

  async updateTag(
    id: string,
    updates: {
      name?: string;
      slug?: string;
      description?: string | null;
    }
  ) {
    const repo = this.ds.getRepository(ArticleTag);
    const tag = await repo.findOne({
      where: { id },
    });
    if (!tag) throw new Error("Category not found");

    if (updates.name !== undefined) tag.name = updates.name.trim();
    if (updates.slug !== undefined)
      tag.slug = updates.slug.trim().toLowerCase();
    if (updates.description !== undefined)
      tag.description = updates.description;
    return await repo.save(tag);
  }

  async getTags(id?: string, name?: string) {
    const repo = this.ds.getRepository(ArticleTag);
    let where = { name };
    if (id) {
      const tag = await repo.findOne({ where: { id } });
      return tag;
    }
    const list = await repo.find({ where });
    return list;
  }

  async deleteTag(id: string) {
    try {
      const repo = this.ds.getRepository(ArticleTag);
      const effect = await repo.delete(id);
      return effect
    } catch (err) {}
  }
}
