import { EmailVerificationCode } from '../../dto/email-verification-code';

export abstract class EmailVerificationCodeRepository {
  abstract save(code: EmailVerificationCode): Promise<void>;
  abstract findByEmail(email: string): Promise<EmailVerificationCode | null>;
  abstract deleteByEmail(email: string): Promise<void>;
}
