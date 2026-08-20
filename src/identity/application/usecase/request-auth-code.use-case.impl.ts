import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import {
  EmailAlreadyInUseException,
  EmailNotFoundException,
} from '../../domain/exception/identity.exceptions';
import { MessageResult } from '../dto/message.result';
import { RequestAuthCodeCommand } from '../dto/request-auth-code.command';
import { RequestAuthCodeUseCase } from '../port/in/request-auth-code.use-case';
import { EmailVerificationCodeRepository } from '../port/out/email-verification-code.repository';
import { RegistrationVerificationSettings } from '../port/out/registration-verification.settings';
import { UserRepository } from '../port/out/user.repository';
import { VerificationCodeHasher } from '../port/out/verification-code-hasher';
import { VerificationCodeSender } from '../port/out/verification-code-sender';
import { AuthInputValidator } from './auth-input.validator';

@Injectable()
export class RequestAuthCodeUseCaseImpl extends RequestAuthCodeUseCase {
  constructor(
    private readonly verificationCodes: EmailVerificationCodeRepository,
    private readonly users: UserRepository,
    private readonly codeHasher: VerificationCodeHasher,
    private readonly verificationCodeSender: VerificationCodeSender,
    private readonly settings: RegistrationVerificationSettings,
  ) {
    super();
  }

  async execute(command: RequestAuthCodeCommand): Promise<MessageResult> {
    const email = AuthInputValidator.normalizeEmail(command.email);
    AuthInputValidator.validateEmail(email);

    const existingUser = await this.users.findByEmail(email);
    if (command.purpose === 'register') {
      if (existingUser) {
        throw new EmailAlreadyInUseException();
      }
    } else if (command.purpose === 'login' && !existingUser) {
      throw new EmailNotFoundException();
    }

    const plainCode = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const expirationMinutes = Math.max(
      this.settings.codeExpirationMinutes(),
      1,
    );
    const expiresAt = new Date(Date.now() + expirationMinutes * 60_000);

    await this.verificationCodes.save({
      email,
      codeHash: await this.codeHasher.hash(plainCode),
      expiresAt,
      isValid: true,
    });
    await this.verificationCodeSender.send(email, plainCode);

    return { message: 'Verification code sent to your email' };
  }
}
