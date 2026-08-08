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

  existsByEmail(email: string): Promise<boolean> {
    return this.users.existsBy({ email });
  }

  async create(email: string, name: string, passwordHash: string): Promise<User> {
    const saved = await this.users.save(
      this.users.create({ email, name, passwordHash }),
    );
    return this.toDomain(saved);
  }

  async findByEmailWithPasswordHash(
    email: string,
  ): Promise<{ user: User; passwordHash: string } | null> {
    const row = await this.users.findOne({ where: { email } });
    if (!row) {
      return null;
    }
    return { user: this.toDomain(row), passwordHash: row.passwordHash };
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
