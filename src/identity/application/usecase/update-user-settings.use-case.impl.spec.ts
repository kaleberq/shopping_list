import {
  InvalidPlanCodeException,
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
    useCase = new UpdateUserSettingsUseCaseImpl(users as never);
  });

  it('updates preferred currency and plan', async () => {
    users.findById.mockResolvedValue({
      id: '1',
      email: 'ada@example.com',
      name: 'Ada',
      preferredCurrency: 'BRL',
      planCode: 'free',
      planName: 'Free',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    users.updateSettings.mockResolvedValue({
      id: '1',
      email: 'ada@example.com',
      name: 'Ada',
      preferredCurrency: 'USD',
      planCode: 'paid',
      planName: 'Paid',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({
        userId: '1',
        preferredCurrency: 'USD',
        planCode: 'paid',
      }),
    ).resolves.toEqual({
      id: '1',
      email: 'ada@example.com',
      name: 'Ada',
      preferredCurrency: 'USD',
      plan: { code: 'paid', name: 'Paid' },
    });
  });

  it('rejects unsupported currency', async () => {
    await expect(
      useCase.execute({
        userId: '1',
        preferredCurrency: 'XYZ',
        planCode: 'free',
      }),
    ).rejects.toBeInstanceOf(InvalidPreferredCurrencyException);
  });

  it('rejects invalid plan code', async () => {
    await expect(
      useCase.execute({
        userId: '1',
        preferredCurrency: 'USD',
        planCode: 'enterprise',
      }),
    ).rejects.toBeInstanceOf(InvalidPlanCodeException);
  });

  it('rejects when user does not exist', async () => {
    users.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: '99',
        preferredCurrency: 'USD',
        planCode: 'paid',
      }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });
});
