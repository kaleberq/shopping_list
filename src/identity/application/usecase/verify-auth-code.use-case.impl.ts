import { Injectable } from '@nestjs/common';
import {
  InvalidVerificationCodeException,
  VerificationCodeExpiredException,
} from '../../domain/exception/identity.exceptions';
import { AuthTokenResult } from '../dto/auth-token.result';
import { VerifyAuthCodeCommand } from '../dto/verify-auth-code.command';
import { VerifyAuthCodeUseCase } from '../port/in/verify-auth-code.use-case';
import { EmailVerificationCodeRepository } from '../port/out/email-verification-code.repository';
import { PasswordHasher } from '../port/out/password-hasher';
import { TokenIssuer } from '../port/out/token-issuer';
import { UserRepository } from '../port/out/user.repository';
import { AuthInputValidator } from './auth-input.validator';

@Injectable()
export class VerifyAuthCodeUseCaseImpl extends VerifyAuthCodeUseCase {
  constructor(
    private readonly verificationCodes: EmailVerificationCodeRepository,
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: TokenIssuer,
  ) {
    super();
  }

  async execute(command: VerifyAuthCodeCommand): Promise<AuthTokenResult> {
    const email = AuthInputValidator.normalizeEmail(command.email);
    const code = (command.code ?? '').trim();
    AuthInputValidator.validateEmail(email);

    if (!code) {
      throw new InvalidVerificationCodeException();
    }

    const verification = await this.verificationCodes.findByEmail(email);
    if (!verification) {
      throw new InvalidVerificationCodeException();
    }

    if (verification.expiresAt.getTime() < Date.now()) {
      await this.verificationCodes.deleteByEmail(email);
      throw new VerificationCodeExpiredException();
    }

    if (!(await this.passwordHasher.matches(code, verification.codeHash))) {
      throw new InvalidVerificationCodeException();
    }

    let user = await this.users.findByEmail(email);
    if (!user) {
      const name =
        command.name?.trim() || AuthInputValidator.defaultNameFromEmail(email);
      user = await this.users.create(email, name);
    }

    await this.verificationCodes.deleteByEmail(email);
    return this.tokenIssuer.issue(user.id);
  }
}
