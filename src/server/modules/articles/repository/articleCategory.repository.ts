import { DataSource, Repository } from "typeorm";
import { AbstractRepository } from "@/server/core/abstracts/repository.base";
import { ArticleCategory } from "../entities/articleCategory.entity";

export class ArticleCategoryRepository extends AbstractRepository<ArticleCategory> {
  protected readonly logger = console;

  constructor(dataSource: DataSource) {
    const repo = dataSource.getRepository(ArticleCategory);
    super(repo, dataSource);
  }
}
