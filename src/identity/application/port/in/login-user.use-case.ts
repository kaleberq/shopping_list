import { AuthTokenResult } from '../../dto/auth-token.result';
import { LoginUserCommand } from '../../dto/login-user.command';

export abstract class LoginUserUseCase {
  abstract execute(command: LoginUserCommand): Promise<AuthTokenResult>;
}
