import { DEFAULT_PLANS } from '../../../../domain/model/plan-id';
import { TypeOrmPlanRepository } from './typeorm-plan.repository';

describe('TypeOrmPlanRepository', () => {
  const plans = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn((value: unknown) => value),
  };

  let repository: TypeOrmPlanRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new TypeOrmPlanRepository(plans as never);
  });

  it('seeds default plans by id when missing', async () => {
    plans.findOne.mockResolvedValue(null);
    plans.save.mockResolvedValue(undefined);

    await repository.ensureDefaults();

    expect(plans.save).toHaveBeenCalledTimes(DEFAULT_PLANS.length);
    for (const plan of DEFAULT_PLANS) {
      expect(plans.create).toHaveBeenCalledWith({
        id: plan.id,
        name: plan.name,
      });
    }
  });
});
