import { AuthTokenResult } from '../../dto/auth-token.result';
import { LoginWithCodeCommand } from '../../dto/login-with-code.command';

export abstract class LoginWithCodeUseCase {
  abstract execute(command: LoginWithCodeCommand): Promise<AuthTokenResult>;
}
