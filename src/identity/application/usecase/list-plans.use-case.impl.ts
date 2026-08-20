import { Injectable } from '@nestjs/common';
import { PlanCatalogResult } from '../dto/plan-catalog.result';
import { ListPlansUseCase } from '../port/in/list-plans.use-case';
import { PlanRepository } from '../port/out/plan.repository';

@Injectable()
export class ListPlansUseCaseImpl extends ListPlansUseCase {
  constructor(private readonly plans: PlanRepository) {
    super();
  }

  async execute(): Promise<PlanCatalogResult> {
    const plans = await this.plans.findAll();
    return {
      plans: plans.map((plan) => ({
        code: plan.code,
        name: plan.name,
      })),
    };
  }
}
