import {
  InvalidPreferredCurrencyException,
  UserNotFoundException,
} from '../../domain/exception/identity.exceptions';
import { UpdateUserSettingsUseCaseImpl } from './update-user-settings.use-case.impl';

describe('UpdateUserSettingsUseCaseImpl', () => {
  const users = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updatePreferredCurrency: jest.fn(),
  };

  let useCase: UpdateUserSettingsUseCaseImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpdateUserSettingsUseCaseImpl(users as never);
  });

  it('updates preferred currency', async () => {
    users.findById.mockResolvedValue({
      id: '1',
      email: 'ada@example.com',
      name: 'Ada',
      preferredCurrency: 'BRL',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    users.updatePreferredCurrency.mockResolvedValue({
      id: '1',
      email: 'ada@example.com',
      name: 'Ada',
      preferredCurrency: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({ userId: '1', preferredCurrency: 'USD' }),
    ).resolves.toEqual({
      id: '1',
      email: 'ada@example.com',
      name: 'Ada',
      preferredCurrency: 'USD',
    });
  });

  it('rejects unsupported currency', async () => {
    await expect(
      useCase.execute({ userId: '1', preferredCurrency: 'XYZ' }),
    ).rejects.toBeInstanceOf(InvalidPreferredCurrencyException);
  });

  it('rejects when user does not exist', async () => {
    users.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ userId: '99', preferredCurrency: 'USD' }),
    ).rejects.toBeInstanceOf(UserNotFoundException);
  });
});
