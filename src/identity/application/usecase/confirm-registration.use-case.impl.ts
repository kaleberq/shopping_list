import { Injectable } from '@nestjs/common';
import {
  EmailAlreadyInUseException,
  InvalidVerificationCodeException,
  VerificationCodeExpiredException,
} from '../../domain/exception/identity.exceptions';
import { AuthTokenResult } from '../dto/auth-token.result';
import { ConfirmRegistrationCommand } from '../dto/confirm-registration.command';
import { ConfirmRegistrationUseCase } from '../port/in/confirm-registration.use-case';
import { EmailVerificationCodeRepository } from '../port/out/email-verification-code.repository';
import { PasswordHasher } from '../port/out/password-hasher';
import { TokenIssuer } from '../port/out/token-issuer';
import { UserRepository } from '../port/out/user.repository';
import { RegistrationInputValidator } from './registration-input.validator';

@Injectable()
export class ConfirmRegistrationUseCaseImpl extends ConfirmRegistrationUseCase {
  constructor(
    private readonly verificationCodes: EmailVerificationCodeRepository,
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: TokenIssuer,
  ) {
    super();
  }

  async execute(command: ConfirmRegistrationCommand): Promise<AuthTokenResult> {
    const email = RegistrationInputValidator.normalizeEmail(command.email);
    const code = (command.code ?? '').trim();
    RegistrationInputValidator.validate(email, command.name, command.password);

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

    if (await this.users.existsByEmail(email)) {
      await this.verificationCodes.deleteByEmail(email);
      throw new EmailAlreadyInUseException(email);
    }

    const user = await this.users.create(
      email,
      command.name.trim(),
      await this.passwordHasher.hash(command.password),
    );
    await this.verificationCodes.deleteByEmail(email);
    return this.tokenIssuer.issue(user.id);
  }
}
