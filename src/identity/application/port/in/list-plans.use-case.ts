import { PlanCatalogResult } from '../../dto/plan-catalog.result';

export abstract class ListPlansUseCase {
  abstract execute(): Promise<PlanCatalogResult>;
}
