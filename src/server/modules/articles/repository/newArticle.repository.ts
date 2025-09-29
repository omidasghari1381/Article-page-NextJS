import { DataSource, Repository } from "typeorm";
import { AbstractRepository } from "@/server/core/abstracts/repository.base";
import { NewArticle } from "../entities/innerArticle";

export class InnerArticleRepository extends AbstractRepository<NewArticle> {
  protected readonly logger = console;

  constructor(dataSource: DataSource) {
    const repo = dataSource.getRepository(NewArticle);
    super(repo, dataSource);
  }
}
