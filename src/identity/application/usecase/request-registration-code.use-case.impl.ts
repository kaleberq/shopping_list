import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { EmailAlreadyInUseException } from '../../domain/exception/identity.exceptions';
import { MessageResult } from '../dto/message.result';
import { RequestRegistrationCodeCommand } from '../dto/request-registration-code.command';
import { RequestRegistrationCodeUseCase } from '../port/in/request-registration-code.use-case';
import { EmailVerificationCodeRepository } from '../port/out/email-verification-code.repository';
import { PasswordHasher } from '../port/out/password-hasher';
import { RegistrationVerificationSettings } from '../port/out/registration-verification.settings';
import { UserRepository } from '../port/out/user.repository';
import { VerificationCodeSender } from '../port/out/verification-code-sender';
import { RegistrationInputValidator } from './registration-input.validator';

@Injectable()
export class RequestRegistrationCodeUseCaseImpl extends RequestRegistrationCodeUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly verificationCodes: EmailVerificationCodeRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly verificationCodeSender: VerificationCodeSender,
    private readonly settings: RegistrationVerificationSettings,
  ) {
    super();
  }

  async execute(command: RequestRegistrationCodeCommand): Promise<MessageResult> {
    const email = RegistrationInputValidator.normalizeEmail(command.email);
    RegistrationInputValidator.validateEmail(email);

    if (await this.users.existsByEmail(email)) {
      throw new EmailAlreadyInUseException(email);
    }

    const plainCode = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const expirationMinutes = Math.max(this.settings.codeExpirationMinutes(), 1);
    const expiresAt = new Date(Date.now() + expirationMinutes * 60_000);

    await this.verificationCodes.save({
      email,
      codeHash: await this.passwordHasher.hash(plainCode),
      expiresAt,
    });
    await this.verificationCodeSender.send(email, plainCode);

    return { message: 'Verification code sent to your email' };
  }
}
