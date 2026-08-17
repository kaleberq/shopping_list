import { QueryFailedError } from 'typeorm';
import { EmailAlreadyInUseException } from '../../../../domain/exception/identity.exceptions';
import { TypeOrmUserRepository } from './typeorm-user.repository';

describe('TypeOrmUserRepository', () => {
  const users = {
    create: jest.fn((value: unknown) => value),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  let repository: TypeOrmUserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new TypeOrmUserRepository(users as never);
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
