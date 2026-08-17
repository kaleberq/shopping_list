import { Plan } from '../../../domain/model/plan';

export abstract class PlanRepository {
  abstract findByCode(code: string): Promise<Plan | null>;
  abstract ensureDefaults(): Promise<void>;
}
