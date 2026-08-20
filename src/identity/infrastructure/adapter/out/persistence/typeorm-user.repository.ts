import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { PlanRepository } from '../../../../application/port/out/plan.repository';
import { UserRepository } from '../../../../application/port/out/user.repository';
import {
  EmailAlreadyInUseException,
  InvalidPlanIdException,
  UserNotFoundException,
} from '../../../../domain/exception/identity.exceptions';
import { PlanId } from '../../../../domain/model/plan-id';
import { User } from '../../../../domain/model/user';
import { UserOrmEntity } from './user.orm-entity';

@Injectable()
export class TypeOrmUserRepository extends UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly users: Repository<UserOrmEntity>,
    private readonly plans: PlanRepository,
  ) {
    super();
  }

  async create(
    email: string,
    name: string,
    preferredCurrency: string,
  ): Promise<User> {
    const freePlan = await this.plans.findById(PlanId.Free);
    if (!freePlan) {
      throw new InvalidPlanIdException();
    }

    try {
      const saved = await this.users.save(
        this.users.create({
          email,
          name,
          preferredCurrency,
          planId: freePlan.id,
        }),
      );
      const row = await this.users.findOne({
        where: { id: saved.id },
        relations: ['plan'],
      });
      if (!row) {
        throw new UserNotFoundException();
      }
      return this.toDomain(row);
    } catch (error) {
      if (error instanceof EmailAlreadyInUseException) {
        throw error;
      }
      if (isUniqueViolation(error)) {
        throw new EmailAlreadyInUseException();
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.users.findOne({
      where: { email },
      relations: ['plan'],
    });
    return row ? this.toDomain(row) : null;
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.users.findOne({
      where: { id },
      relations: ['plan'],
    });
    return row ? this.toDomain(row) : null;
  }

  async updateSettings(
    id: string,
    preferredCurrency: string,
    planId: string,
  ): Promise<User> {
    const plan = await this.plans.findById(planId);
    if (!plan) {
      throw new InvalidPlanIdException();
    }

    const result = await this.users.update(id, {
      preferredCurrency,
      planId: plan.id,
    });
    if (result.affected === 0) {
      throw new UserNotFoundException();
    }

    const reloaded = await this.users.findOne({
      where: { id },
      relations: ['plan'],
    });
    if (!reloaded) {
      throw new UserNotFoundException();
    }
    return this.toDomain(reloaded);
  }

  private toDomain(row: UserOrmEntity): User {
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      preferredCurrency: row.preferredCurrency,
      planId: row.planId,
      planName: row.plan.name,
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
