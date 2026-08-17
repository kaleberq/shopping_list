import { Injectable } from '@nestjs/common';
import {
  EmailAlreadyInUseException,
  InvalidPreferredCurrencyException,
} from '../../domain/exception/identity.exceptions';
import { isSupportedCurrency } from '../../domain/model/supported-currencies';
import { AuthTokenResult } from '../dto/auth-token.result';
import { RegisterWithCodeCommand } from '../dto/register-with-code.command';
import { RegisterWithCodeUseCase } from '../port/in/register-with-code.use-case';
import { EmailVerificationCodeRepository } from '../port/out/email-verification-code.repository';
import { PasswordHasher } from '../port/out/password-hasher';
import { TokenIssuer } from '../port/out/token-issuer';
import { UserRepository } from '../port/out/user.repository';
import { assertValidVerificationCode } from './assert-valid-verification-code';
import { AuthInputValidator } from './auth-input.validator';

@Injectable()
export class RegisterWithCodeUseCaseImpl extends RegisterWithCodeUseCase {
  constructor(
    private readonly verificationCodes: EmailVerificationCodeRepository,
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: TokenIssuer,
  ) {
    super();
  }

  async execute(command: RegisterWithCodeCommand): Promise<AuthTokenResult> {
    const email = AuthInputValidator.normalizeEmail(command.email);
    const code = (command.code ?? '').trim();
    const name = (command.name ?? '').trim();
    const preferredCurrency = AuthInputValidator.normalizeCurrency(
      command.preferredCurrency,
    );
    AuthInputValidator.validateEmail(email);
    AuthInputValidator.validateName(name);
    AuthInputValidator.validatePreferredCurrency(preferredCurrency);
    if (!isSupportedCurrency(preferredCurrency)) {
      throw new InvalidPreferredCurrencyException();
    }

    if (await this.users.findByEmail(email)) {
      throw new EmailAlreadyInUseException(email);
    }

    await assertValidVerificationCode(
      this.verificationCodes,
      this.passwordHasher,
      email,
      code,
    );

    const user = await this.users.create(email, name, preferredCurrency);
    await this.verificationCodes.invalidateByEmail(email);
    return this.tokenIssuer.issue(user.id);
  }
}
