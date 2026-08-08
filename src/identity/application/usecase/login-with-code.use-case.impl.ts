import { Injectable } from '@nestjs/common';
import { AuthTokenResult } from '../dto/auth-token.result';
import { LoginWithCodeCommand } from '../dto/login-with-code.command';
import { LoginWithCodeUseCase } from '../port/in/login-with-code.use-case';
import { EmailVerificationCodeRepository } from '../port/out/email-verification-code.repository';
import { PasswordHasher } from '../port/out/password-hasher';
import { TokenIssuer } from '../port/out/token-issuer';
import { UserRepository } from '../port/out/user.repository';
import { assertValidVerificationCode } from './assert-valid-verification-code';
import { AuthInputValidator } from './auth-input.validator';

@Injectable()
export class LoginWithCodeUseCaseImpl extends LoginWithCodeUseCase {
  constructor(
    private readonly verificationCodes: EmailVerificationCodeRepository,
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: TokenIssuer,
  ) {
    super();
  }

  async execute(command: LoginWithCodeCommand): Promise<AuthTokenResult> {
    const email = AuthInputValidator.normalizeEmail(command.email);
    const code = (command.code ?? '').trim();
    AuthInputValidator.validateEmail(email);

    await assertValidVerificationCode(
      this.verificationCodes,
      this.passwordHasher,
      email,
      code,
    );

    let user = await this.users.findByEmail(email);
    if (!user) {
      user = await this.users.create(
        email,
        AuthInputValidator.defaultNameFromEmail(email),
      );
    }

    await this.verificationCodes.invalidateByEmail(email);
    return this.tokenIssuer.issue(user.id);
  }
}
