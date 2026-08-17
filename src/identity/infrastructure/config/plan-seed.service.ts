import { Injectable, OnModuleInit } from '@nestjs/common';
import { PlanRepository } from '../../application/port/out/plan.repository';

@Injectable()
export class PlanSeedService implements OnModuleInit {
  constructor(private readonly plans: PlanRepository) {}

  async onModuleInit(): Promise<void> {
    await this.plans.ensureDefaults();
  }
}
