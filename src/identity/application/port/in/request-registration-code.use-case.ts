import { MessageResult } from '../../dto/message.result';
import { RequestRegistrationCodeCommand } from '../../dto/request-registration-code.command';

export abstract class RequestRegistrationCodeUseCase {
  abstract execute(command: RequestRegistrationCodeCommand): Promise<MessageResult>;
}
