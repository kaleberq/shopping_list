import { MessageResult } from '../../dto/message.result';
import { RequestAuthCodeCommand } from '../../dto/request-auth-code.command';

export abstract class RequestAuthCodeUseCase {
  abstract execute(command: RequestAuthCodeCommand): Promise<MessageResult>;
}
