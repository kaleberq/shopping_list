import {
  EmailAlreadyInUseException,
  EmailNotFoundException,
  InvalidVerificationCodeException,
} from '../../domain/exception/identity.exceptions';
import { LoginWithCodeUseCaseImpl } from './login-with-code.use-case.impl';
import { RegisterWithCodeUseCaseImpl } from './register-with-code.use-case.impl';

describe('LoginWithCodeUseCaseImpl', () => {
  const verificationCodes = {
    save: jest.fn(),
    findValidByEmail: jest.fn(),
    invalidateByEmail: jest.fn(),
  };
  const users = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updatePreferredCurrency: jest.fn(),
  };
  const codeHasher = {
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
      verificationCodes,
      users as never,
      codeHasher,
      tokenIssuer,
    );
  });

  it('returns token for existing user with valid code', async () => {
    verificationCodes.findValidByEmail.mockResolvedValue({
      email: 'ada@example.com',
      codeHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
      isValid: true,
    });
    codeHasher.matches.mockResolvedValue(true);
    users.findByEmail.mockResolvedValue({ id: '9', email: 'ada@example.com' });

    const result = await useCase.execute({
      email: 'ada@example.com',
      code: '123456',
    });

    expect(users.create).not.toHaveBeenCalled();
    expect(result.accessToken).toBe('token');
    expect(tokenIssuer.issue).toHaveBeenCalledWith('9');
  });

  it('rejects when user does not exist', async () => {
    verificationCodes.findValidByEmail.mockResolvedValue({
      email: 'ada@example.com',
      codeHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
      isValid: true,
    });
    codeHasher.matches.mockResolvedValue(true);
    users.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'ada@example.com', code: '123456' }),
    ).rejects.toBeInstanceOf(EmailNotFoundException);
  });

  it('rejects invalid code', async () => {
    verificationCodes.findValidByEmail.mockResolvedValue({
      email: 'ada@example.com',
      codeHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
      isValid: true,
    });
    codeHasher.matches.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'ada@example.com', code: '000000' }),
    ).rejects.toBeInstanceOf(InvalidVerificationCodeException);
  });
});

describe('RegisterWithCodeUseCaseImpl', () => {
  const verificationCodes = {
    save: jest.fn(),
    findValidByEmail: jest.fn(),
    invalidateByEmail: jest.fn(),
  };
  const users = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updatePreferredCurrency: jest.fn(),
  };
  const codeHasher = {
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

  let useCase: RegisterWithCodeUseCaseImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new RegisterWithCodeUseCaseImpl(
      verificationCodes,
      users as never,
      codeHasher,
      tokenIssuer,
    );
  });

  it('creates user with name and returns token', async () => {
    verificationCodes.findValidByEmail.mockResolvedValue({
      email: 'ada@example.com',
      codeHash: 'hash',
      expiresAt: new Date(Date.now() + 60_000),
      isValid: true,
    });
    codeHasher.matches.mockResolvedValue(true);
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue({ id: '1', email: 'ada@example.com' });

    const result = await useCase.execute({
      email: 'ada@example.com',
      code: '123456',
      name: 'Ada Lovelace',
      preferredCurrency: 'BRL',
    });

    expect(users.create).toHaveBeenCalledWith(
      'ada@example.com',
      'Ada Lovelace',
      'BRL',
    );
    expect(result.accessToken).toBe('token');
  });

  it('rejects when email is already registered', async () => {
    users.findByEmail.mockResolvedValue({ id: '9', email: 'ada@example.com' });

    await expect(
      useCase.execute({
        email: 'ada@example.com',
        code: '123456',
        name: 'Ada',
        preferredCurrency: 'BRL',
      }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseException);
    expect(verificationCodes.findValidByEmail).not.toHaveBeenCalled();
  });
});
