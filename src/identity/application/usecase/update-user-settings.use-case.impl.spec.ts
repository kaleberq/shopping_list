import {
  InvalidPlanIdException,
  InvalidPreferredCurrencyException,
  UserNotFoundException,
} from '../../domain/exception/identity.exceptions';
import { UpdateUserSettingsUseCaseImpl } from './update-user-settings.use-case.impl';

describe('UpdateUserSettingsUseCaseImpl', () => {
  const users = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updateSettings: jest.fn(),
  };

  let useCase: UpdateUserSettingsUseCaseImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateUserSettingsUseCaseImpl(users);
  });

  it('updates preferred currency and plan', async () => {
    users.findById.mockResolvedValue({
      id: '1',
      email: 'ada@example.com',
      name: 'Ada',
      preferredCurrency: 'BRL',
      planId: '1',
      planName: 'Free',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    users.updateSettings.mockResolvedValue({
      id: '1',
      email: 'ada@example.com',
      name: 'Ada',
      preferredCurrency: 'USD',
      planId: '2',
      planName: 'Premium',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({
        userId: '1',
        preferredCurrency: 'USD',
        planId: '2',
      }),
    ).resolves.toEqual({
      id: '1',
      email: 'ada@example.com',
      name: 'Ada',
      preferredCurrency: 'USD',
      plan: { id: '2', name: 'Premium' },
    });
  });

  it('rejects unsupported currency', async () => {
    await expect(
      useCase.execute({
        userId: '1',
        preferredCurrency: 'XYZ',
        planId: '1',
      }),
    ).rejects.toBeInstanceOf(InvalidPreferredCurrencyException);
  });

  it('rejects empty plan id', async () => {
    await expect(
      useCase.execute({
        userId: '1',
        preferredCurrency: 'USD',
        planId: '   ',
      }),
    ).rejects.toBeInstanceOf(InvalidPlanIdException);
  });

  it('rejects when user does not exist', async () => {
    users.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: '99',
        preferredCurrency: 'USD',
        planId: '2',
      }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });
});
