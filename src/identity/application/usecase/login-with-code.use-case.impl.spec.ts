import { InvalidVerificationCodeException } from '../../domain/exception/identity.exceptions';
import { LoginWithCodeUseCaseImpl } from './login-with-code.use-case.impl';

describe('LoginWithCodeUseCaseImpl', () => {
  const verificationCodes = {
    save: jest.fn(),
    findValidByEmail: jest.fn(),
    invalidateByEmail: jest.fn(),
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

  let useCase: LoginWithCodeUseCaseImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginWithCodeUseCaseImpl(
      verificationCodes as never,
      users as never,
      passwordHasher as never,
      tokenIssuer as never,
    );
  });

  it('creates user and returns token when email is new', async () => {
    verificationCodes.findValidByEmail.mockResolvedValue({
      email: 'ada@example.com',
      codeHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
      isValid: true,
    });
    passwordHasher.matches.mockResolvedValue(true);
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue({ id: '1', email: 'ada@example.com' });

    const result = await useCase.execute({
      email: 'ada@example.com',
      code: '123456',
    });

    expect(users.create).toHaveBeenCalledWith('ada@example.com', 'ada');
    expect(tokenIssuer.issue).toHaveBeenCalledWith('1');
    expect(result.accessToken).toBe('token');
  });

  it('returns token for existing user with valid code', async () => {
    verificationCodes.findValidByEmail.mockResolvedValue({
      email: 'ada@example.com',
      codeHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
      isValid: true,
    });
    passwordHasher.matches.mockResolvedValue(true);
    users.findByEmail.mockResolvedValue({ id: '9', email: 'ada@example.com' });

    const result = await useCase.execute({
      email: 'ada@example.com',
      code: '123456',
    });

    expect(users.create).not.toHaveBeenCalled();
    expect(result.accessToken).toBe('token');
    expect(tokenIssuer.issue).toHaveBeenCalledWith('9');
    expect(verificationCodes.invalidateByEmail).toHaveBeenCalledWith(
      'ada@example.com',
    );
  });

  it('rejects invalid code', async () => {
    verificationCodes.findValidByEmail.mockResolvedValue({
      email: 'ada@example.com',
      codeHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
      isValid: true,
    });
    passwordHasher.matches.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'ada@example.com', code: '000000' }),
    ).rejects.toBeInstanceOf(InvalidVerificationCodeException);
  });
});
