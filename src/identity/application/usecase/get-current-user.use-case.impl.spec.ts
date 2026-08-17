import { UserNotFoundException } from '../../domain/exception/identity.exceptions';
import { GetCurrentUserUseCaseImpl } from './get-current-user.use-case.impl';

describe('GetCurrentUserUseCaseImpl', () => {
  const users = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updatePreferredCurrency: jest.fn(),
  };

  let useCase: GetCurrentUserUseCaseImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetCurrentUserUseCaseImpl(users as never);
  });

  it('returns user profile', async () => {
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

    await expect(useCase.execute('1')).resolves.toEqual({
      id: '1',
      email: 'ada@example.com',
      name: 'Ada',
      preferredCurrency: 'BRL',
      plan: { code: 'free', name: 'Free' },
    });
  });

  it('rejects when user does not exist', async () => {
    users.findById.mockResolvedValue(null);

    await expect(useCase.execute('99')).rejects.toBeInstanceOf(
      UserNotFoundException,
    );
  });
});
