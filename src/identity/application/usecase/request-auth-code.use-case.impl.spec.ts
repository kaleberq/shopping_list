import { RequestAuthCodeUseCaseImpl } from './request-auth-code.use-case.impl';

describe('RequestAuthCodeUseCaseImpl', () => {
  const verificationCodes = {
    save: jest.fn(),
    findByEmail: jest.fn(),
    deleteByEmail: jest.fn(),
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
    useCase = new RequestAuthCodeUseCaseImpl(
      verificationCodes,
      passwordHasher,
      verificationCodeSender,
      settings,
    );
  });

  it('sends a code for new or existing emails', async () => {
    const result = await useCase.execute({ email: ' Ada@Example.com ' });

    expect(result).toEqual({ message: 'Verification code sent to your email' });
    expect(verificationCodes.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ada@example.com',
        codeHash: 'hashed-code',
      }),
    );
    expect(verificationCodeSender.send).toHaveBeenCalledWith(
      'ada@example.com',
      expect.stringMatching(/^\d{6}$/),
    );
  });

  it('rejects invalid email', async () => {
    await expect(useCase.execute({ email: 'not-an-email' })).rejects.toThrow(
      'Invalid email',
    );
  });
});
