import { EmailVerificationCode } from '../../../domain/model/email-verification-code';

export abstract class EmailVerificationCodeRepository {
  abstract save(code: EmailVerificationCode): Promise<void>;
  abstract findValidByEmail(
    email: string,
  ): Promise<EmailVerificationCode | null>;
  abstract invalidateByEmail(email: string): Promise<void>;
}
