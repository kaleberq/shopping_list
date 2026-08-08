import { MessageResult } from '../../dto/message.result';
import { VerifyAuthCodeCommand } from '../../dto/verify-auth-code.command';

export abstract class VerifyAuthCodeUseCase {
  abstract execute(command: VerifyAuthCodeCommand): Promise<MessageResult>;
}
