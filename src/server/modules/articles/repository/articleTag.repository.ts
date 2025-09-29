import { DataSource } from "typeorm";
import { AbstractRepository } from "@/server/core/abstracts/repository.base";
import { ArticleTag } from "../entities/articleTages.entity";

export class ArticleTagRepository extends AbstractRepository<ArticleTag> {
  protected readonly logger = console;

  constructor(dataSource: DataSource) {
    const repo = dataSource.getRepository(ArticleTag);
    super(repo, dataSource);
  }
}
