import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../../../application/port/out/user.repository';
import { User } from '../../../../domain/model/user';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class TypeOrmUserRepository extends UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly users: Repository<UserOrmEntity>,
  ) {
    super();
  }

  async create(email: string, name: string): Promise<User> {
    const saved = await this.users.save(this.users.create({ email, name }));
    return this.toDomain(saved);
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.users.findOne({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  private toDomain(row: UserOrmEntity): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
