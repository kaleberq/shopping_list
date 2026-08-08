import {
  InvalidVerificationCodeException,
  VerificationCodeExpiredException,
} from '../../domain/exception/identity.exceptions';
import { VerifyAuthCodeUseCaseImpl } from './verify-auth-code.use-case.impl';

describe('VerifyAuthCodeUseCaseImpl', () => {
  const verificationCodes = {
    save: jest.fn(),
    findByEmail: jest.fn(),
    deleteByEmail: jest.fn(),
  };
  const users = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };
  const passwordHasher = {
    hash: jest.fn(),
    matches: jest.fn(),
  };
  const tokenIssuer = {
    issue: jest.fn().mockResolvedValue({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
    }),
  };

  let useCase: VerifyAuthCodeUseCaseImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new VerifyAuthCodeUseCaseImpl(
      verificationCodes,
      users,
      passwordHasher,
      tokenIssuer,
    );
  });

  it('creates user and returns token when email is new', async () => {
    verificationCodes.findByEmail.mockResolvedValue({
      email: 'ada@example.com',
      codeHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
    });
    passwordHasher.matches.mockResolvedValue(true);
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue({ id: '1', email: 'ada@example.com' });

    const result = await useCase.execute({
      email: 'ada@example.com',
      code: '123456',
      name: 'Ada',
    });

    expect(users.create).toHaveBeenCalledWith('ada@example.com', 'Ada');
    expect(verificationCodes.deleteByEmail).toHaveBeenCalledWith(
      'ada@example.com',
    );
    expect(result.accessToken).toBe('token');
  });

  it('logs in existing user without creating', async () => {
    verificationCodes.findByEmail.mockResolvedValue({
      email: 'ada@example.com',
      codeHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
    });
    passwordHasher.matches.mockResolvedValue(true);
    users.findByEmail.mockResolvedValue({ id: '9', email: 'ada@example.com' });

    await useCase.execute({ email: 'ada@example.com', code: '123456' });

    expect(users.create).not.toHaveBeenCalled();
    expect(tokenIssuer.issue).toHaveBeenCalledWith('9');
  });

  it('rejects expired code', async () => {
    verificationCodes.findByEmail.mockResolvedValue({
      email: 'ada@example.com',
      codeHash: 'hash',
      expiresAt: new Date(Date.now() - 1),
    });

    await expect(
      useCase.execute({ email: 'ada@example.com', code: '123456' }),
    ).rejects.toBeInstanceOf(VerificationCodeExpiredException);
  });

  it('rejects invalid code', async () => {
    verificationCodes.findByEmail.mockResolvedValue({
      email: 'ada@example.com',
      codeHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
    });
    passwordHasher.matches.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'ada@example.com', code: '000000' }),
    ).rejects.toBeInstanceOf(InvalidVerificationCodeException);
  });
});
