import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanRepository } from '../../../../application/port/out/plan.repository';
import { PLAN_CODES } from '../../../../domain/model/plan-codes';
import { Plan } from '../../../../domain/model/plan';
import { PlanOrmEntity } from './plan.orm-entity';

@Injectable()
export class TypeOrmPlanRepository extends PlanRepository {
  constructor(
    @InjectRepository(PlanOrmEntity)
    private readonly plans: Repository<PlanOrmEntity>,
  ) {
    super();
  }

  async findByCode(code: string): Promise<Plan | null> {
    const row = await this.plans.findOne({
      where: { code: code.trim().toLowerCase() },
    });
    return row ? this.toDomain(row) : null;
  }

  async ensureDefaults(): Promise<void> {
    await this.ensurePlan(PLAN_CODES.free, 'Free');
    await this.ensurePlan(PLAN_CODES.paid, 'Paid');
  }

  private async ensurePlan(code: string, name: string): Promise<void> {
    const existing = await this.plans.findOne({ where: { code } });
    if (existing) {
      return;
    }
    await this.plans.save(this.plans.create({ code, name }));
  }

  private toDomain(row: PlanOrmEntity): Plan {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      createdAt: row.createdAt,
    };
  }
}
