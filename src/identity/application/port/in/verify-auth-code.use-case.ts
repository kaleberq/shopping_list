import { AuthTokenResult } from '../../dto/auth-token.result';
import { VerifyAuthCodeCommand } from '../../dto/verify-auth-code.command';

export abstract class VerifyAuthCodeUseCase {
  abstract execute(command: VerifyAuthCodeCommand): Promise<AuthTokenResult>;
}
