import { Plan } from '../../../domain/model/plan';

export abstract class PlanRepository {
  abstract findById(id: string): Promise<Plan | null>;
  abstract findAll(): Promise<Plan[]>;
}
