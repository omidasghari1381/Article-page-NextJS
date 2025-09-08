import { DataSource } from "typeorm";
import { AbstractRepository } from "@/server/core/abstracts/repository.base";
import { FAQ } from "../entities/faq.entity";

export class FAQRepository extends AbstractRepository<FAQ> {
  protected readonly logger = console;
  constructor(ds: DataSource) {
    super(ds.getRepository(FAQ), ds);
  }
}
