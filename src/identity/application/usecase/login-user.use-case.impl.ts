import { Injectable } from '@nestjs/common';
import { InvalidCredentialsException } from '../../domain/exception/identity.exceptions';
import { AuthTokenResult } from '../dto/auth-token.result';
import { LoginUserCommand } from '../dto/login-user.command';
import { LoginUserUseCase } from '../port/in/login-user.use-case';
import { PasswordHasher } from '../port/out/password-hasher';
import { TokenIssuer } from '../port/out/token-issuer';
import { UserRepository } from '../port/out/user.repository';
import { RegistrationInputValidator } from './registration-input.validator';

@Injectable()
export class LoginUserUseCaseImpl extends LoginUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenIssuer: TokenIssuer,
  ) {
    super();
  }

  async execute(command: LoginUserCommand): Promise<AuthTokenResult> {
    const email = RegistrationInputValidator.normalizeEmail(command.email);
    if (!email || !command.password?.trim()) {
      throw new InvalidCredentialsException();
    }

    const found = await this.users.findByEmailWithPasswordHash(email);
    if (!found) {
      throw new InvalidCredentialsException();
    }

    const valid = await this.passwordHasher.matches(
      command.password,
      found.passwordHash,
    );
    if (!valid) {
      throw new InvalidCredentialsException();
    }

    return this.tokenIssuer.issue(found.user.id);
  }
}
