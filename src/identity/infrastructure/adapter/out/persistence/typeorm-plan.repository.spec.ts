import { PLAN_CODES } from '../../../../domain/model/plan-codes';
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

  it('seeds default plans when missing', async () => {
    plans.findOne.mockResolvedValue(null);
    plans.save.mockResolvedValue(undefined);

    await repository.ensureDefaults();

    expect(plans.save).toHaveBeenCalledTimes(2);
    expect(plans.create).toHaveBeenCalledWith({
      code: PLAN_CODES.free,
      name: 'Free',
    });
    expect(plans.create).toHaveBeenCalledWith({
      code: PLAN_CODES.paid,
      name: 'Paid',
    });
  });
});
