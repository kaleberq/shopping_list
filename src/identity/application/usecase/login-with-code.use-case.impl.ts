import { Injectable } from '@nestjs/common';
import { EmailNotFoundException } from '../../domain/exception/identity.exceptions';
import { AuthTokenResult } from '../dto/auth-token.result';
import { LoginWithCodeCommand } from '../dto/login-with-code.command';
import { LoginWithCodeUseCase } from '../port/in/login-with-code.use-case';
import { EmailVerificationCodeRepository } from '../port/out/email-verification-code.repository';
import { TokenIssuer } from '../port/out/token-issuer';
import { UserRepository } from '../port/out/user.repository';
import { VerificationCodeHasher } from '../port/out/verification-code-hasher';
import { assertValidVerificationCode } from './assert-valid-verification-code';
import { AuthInputValidator } from './auth-input.validator';

@Injectable()
export class LoginWithCodeUseCaseImpl extends LoginWithCodeUseCase {
  constructor(
    private readonly verificationCodes: EmailVerificationCodeRepository,
    private readonly users: UserRepository,
    private readonly codeHasher: VerificationCodeHasher,
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
      this.codeHasher,
      email,
      code,
    );

    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new EmailNotFoundException();
    }

    await this.verificationCodes.invalidateByEmail(email);
    return this.tokenIssuer.issue(user.id);
  }
}
