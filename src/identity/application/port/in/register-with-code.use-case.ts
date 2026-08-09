import { AuthTokenResult } from '../../dto/auth-token.result';
import { RegisterWithCodeCommand } from '../../dto/register-with-code.command';

export abstract class RegisterWithCodeUseCase {
  abstract execute(command: RegisterWithCodeCommand): Promise<AuthTokenResult>;
}
