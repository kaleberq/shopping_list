import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { UserRepository } from '../../../../application/port/out/user.repository';
import { EmailAlreadyInUseException } from '../../../../domain/exception/identity.exceptions';
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

  async create(
    email: string,
    name: string,
    preferredCurrency: string,
  ): Promise<User> {
    try {
      const saved = await this.users.save(
        this.users.create({ email, name, preferredCurrency }),
      );
      return this.toDomain(saved);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new EmailAlreadyInUseException(email);
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.users.findOne({ where: { email } });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.users.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async updatePreferredCurrency(
    id: string,
    preferredCurrency: string,
  ): Promise<User> {
    const row = await this.users.findOne({ where: { id } });
    if (!row) {
      throw new Error('User not found');
    }
    row.preferredCurrency = preferredCurrency;
    const saved = await this.users.save(row);
    return this.toDomain(saved);
  }

  private toDomain(row: UserOrmEntity): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      preferredCurrency: row.preferredCurrency,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }
  const driverError = error.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}
