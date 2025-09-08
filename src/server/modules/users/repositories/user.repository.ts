import { DataSource } from 'typeorm';
import { AbstractRepository } from '@/server/core/abstracts/repository.base';
import { User } from '../entities/user.entity';

export class UserRepository extends AbstractRepository<User> {
  protected readonly logger = console;
  constructor(ds: DataSource) {
    super(ds.getRepository(User), ds);
  }
  findByPhone(phone: string) {
    return this.repo.findOne({ where: { phone } }) as Promise<User | null>;
  }
}