import { AuthTokenResult } from '../../dto/auth-token.result';
import { ConfirmRegistrationCommand } from '../../dto/confirm-registration.command';

export abstract class ConfirmRegistrationUseCase {
  abstract execute(command: ConfirmRegistrationCommand): Promise<AuthTokenResult>;
}
