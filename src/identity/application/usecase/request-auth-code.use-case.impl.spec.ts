import { EmailAlreadyInUseException } from '../../domain/exception/identity.exceptions';
import { RequestAuthCodeUseCaseImpl } from './request-auth-code.use-case.impl';

describe('RequestAuthCodeUseCaseImpl', () => {
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
    hash: jest.fn().mockResolvedValue('hashed-code'),
    matches: jest.fn(),
  };
  const verificationCodeSender = {
    send: jest.fn().mockResolvedValue(undefined),
  };
  const settings = {
    codeExpirationMinutes: jest.fn().mockReturnValue(10),
  };

  let useCase: RequestAuthCodeUseCaseImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    users.findByEmail.mockResolvedValue(null);
    useCase = new RequestAuthCodeUseCaseImpl(
      verificationCodes as never,
      users as never,
      passwordHasher as never,
      verificationCodeSender as never,
      settings as never,
    );
  });

  it('sends a code for login without checking existing user', async () => {
    users.findByEmail.mockResolvedValue({ id: '1', email: 'ada@example.com' });

    const result = await useCase.execute({
      email: ' Ada@Example.com ',
      purpose: 'login',
    });

    expect(result).toEqual({ message: 'Verification code sent to your email' });
    expect(users.findByEmail).not.toHaveBeenCalled();
    expect(verificationCodes.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ada@example.com',
        codeHash: 'hashed-code',
        isValid: true,
      }),
    );
    expect(verificationCodeSender.send).toHaveBeenCalledWith(
      'ada@example.com',
      expect.stringMatching(/^\d{6}$/),
    );
  });

  it('rejects register when email already exists', async () => {
    users.findByEmail.mockResolvedValue({ id: '1', email: 'ada@example.com' });

    await expect(
      useCase.execute({ email: 'ada@example.com', purpose: 'register' }),
    ).rejects.toBeInstanceOf(EmailAlreadyInUseException);
    expect(verificationCodes.save).not.toHaveBeenCalled();
    expect(verificationCodeSender.send).not.toHaveBeenCalled();
  });

  it('sends a code for register when email is free', async () => {
    const result = await useCase.execute({
      email: 'ada@example.com',
      purpose: 'register',
    });

    expect(result).toEqual({ message: 'Verification code sent to your email' });
    expect(users.findByEmail).toHaveBeenCalledWith('ada@example.com');
  });

  it('rejects invalid email', async () => {
    await expect(useCase.execute({ email: 'not-an-email' })).rejects.toThrow(
      'Invalid email',
    );
  });
});
