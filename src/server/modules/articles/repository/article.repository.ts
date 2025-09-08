import { DataSource, Repository } from "typeorm";
import { Article } from "../entities/article.entity";
import { AbstractRepository } from "@/server/core/abstracts/repository.base";

export class ArticleRepository extends AbstractRepository<Article> {
  protected readonly logger = console;

  constructor(dataSource: DataSource) {
    const repo = dataSource.getRepository(Article);
    super(repo, dataSource);
  }
}
