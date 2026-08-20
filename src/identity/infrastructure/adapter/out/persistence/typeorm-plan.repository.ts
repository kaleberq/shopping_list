import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanDefaultsEnsurer } from '../../../../application/port/out/plan-defaults-ensurer';
import { PlanRepository } from '../../../../application/port/out/plan.repository';
import { DEFAULT_PLANS } from '../../../../domain/model/plan-id';
import { Plan } from '../../../../domain/model/plan';
import { PlanOrmEntity } from './plan.orm-entity';

@Injectable()
export class TypeOrmPlanRepository
  extends PlanRepository
  implements PlanDefaultsEnsurer
{
  constructor(
    @InjectRepository(PlanOrmEntity)
    private readonly plans: Repository<PlanOrmEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<Plan | null> {
    const row = await this.plans.findOne({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findAll(): Promise<Plan[]> {
    const rows = await this.plans.find({ order: { id: 'ASC' } });
    return rows.map((row) => this.toDomain(row));
  }

  async ensureDefaults(): Promise<void> {
    for (const plan of DEFAULT_PLANS) {
      await this.ensurePlan(plan.id, plan.name);
    }
  }

  private async ensurePlan(id: string, name: string): Promise<void> {
    const existing = await this.plans.findOne({ where: { id } });
    if (existing) {
      return;
    }
    await this.plans.save(this.plans.create({ id, name }));
  }

  private toDomain(row: PlanOrmEntity): Plan {
    return {
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
    };
  }
}
