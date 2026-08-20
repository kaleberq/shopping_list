import { Injectable, OnModuleInit } from '@nestjs/common';
import { PlanDefaultsEnsurer } from '../../application/port/out/plan-defaults-ensurer';

@Injectable()
export class PlanSeedService implements OnModuleInit {
  constructor(private readonly planDefaults: PlanDefaultsEnsurer) {}

  async onModuleInit(): Promise<void> {
    await this.planDefaults.ensureDefaults();
  }
}
