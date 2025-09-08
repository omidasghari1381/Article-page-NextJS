// src/server/modules/faq/faq.adapter.ts
import { AppDataSource } from '@/server/db/typeorm.datasource';
import { CreateFaqDto } from '@/server/modules/faq/dtos/faq.dto';
import { FAQ } from '@/server/modules/faq/entities/faq.entity';
import { FAQService } from '@/server/modules/faq/services/faq.service';
import 'server-only';
import { DataSource } from 'typeorm';
import { FindManyOptions } from 'typeorm';

type FAQRepositoryPort = {
  create(dto: CreateFaqDto): Promise<FAQ>;
  find(opts: FindManyOptions<FAQ>): Promise<FAQ[]>;
  deleteAll(id: string): Promise<number>;
};

let _service: FAQService | null = null;

async function getDS(): Promise<DataSource> {
  if (!AppDataSource.isInitialized) await AppDataSource.initialize();
  return AppDataSource;
}

export async function getFaqService(): Promise<FAQService> {
  if (_service) return _service;

  const ds = await getDS();
  const ormRepo = ds.getRepository(FAQ);

  const repo: FAQRepositoryPort = {
    async create(dto) {
      const entity = ormRepo.create(dto);
      return entity
    },
    async find(opts) {
      return ormRepo.find(opts);
    },
    async deleteAll(id) {
      const res = await ormRepo.delete(id);
      return res.affected ?? 0;
    },
  };

  _service = new FAQService(repo as any);
  return _service;
}