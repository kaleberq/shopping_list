import { QueryFailedError } from 'typeorm';
import { EmailAlreadyInUseException } from '../../../../domain/exception/identity.exceptions';
import { PlanId } from '../../../../domain/model/plan-id';
import { TypeOrmUserRepository } from './typeorm-user.repository';

describe('TypeOrmUserRepository', () => {
  const users = {
    create: jest.fn((value: unknown) => value),
    save: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
  };
  const plans = {
    findById: jest.fn(),
    findAll: jest.fn(),
  };

  let repository: TypeOrmUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    plans.findById.mockResolvedValue({
      id: '1',
      name: 'Free',
    });
    repository = new TypeOrmUserRepository(users as never, plans);
  });

  it('assigns free plan on create', async () => {
    users.save.mockResolvedValue({ id: '9', email: 'ada@example.com' });
    users.findOne.mockResolvedValue({
      id: '9',
      email: 'ada@example.com',
      name: 'Ada',
      preferredCurrency: 'BRL',
      planId: '1',
      plan: { id: '1', name: 'Free' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user = await repository.create('ada@example.com', 'Ada', 'BRL');

    expect(plans.findById).toHaveBeenCalledWith(PlanId.Free);
    expect(users.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ada@example.com',
        planId: '1',
      }),
    );
    expect(user.planId).toBe('1');
    expect(user.planName).toBe('Free');
  });

  it('returns updated plan after settings change', async () => {
    users.update.mockResolvedValue({ affected: 1 });
    users.findOne.mockResolvedValue({
      id: '9',
      email: 'ada@example.com',
      name: 'Ada',
      preferredCurrency: 'USD',
      planId: '2',
      plan: { id: '2', name: 'Premium' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    plans.findById.mockResolvedValue({
      id: '2',
      name: 'Premium',
    });

    const user = await repository.updateSettings('9', 'USD', '2');

    expect(users.update).toHaveBeenCalledWith('9', {
      preferredCurrency: 'USD',
      planId: '2',
    });
    expect(user.planId).toBe('2');
    expect(user.planName).toBe('Premium');
    expect(user.preferredCurrency).toBe('USD');
  });

  it('maps unique email constraint to EmailAlreadyInUseException', async () => {
    const driverError = Object.assign(new Error('duplicate key'), {
      code: '23505',
    });
    users.save.mockRejectedValue(
      new QueryFailedError('INSERT', [], driverError),
    );

    await expect(
      repository.create('ada@example.com', 'Ada', 'BRL'),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseException);
  });
});
