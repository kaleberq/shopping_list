import {
  InvalidVerificationCodeException,
  VerificationCodeExpiredException,
} from '../../domain/exception/identity.exceptions';
import { EmailVerificationCodeRepository } from '../port/out/email-verification-code.repository';
import { PasswordHasher } from '../port/out/password-hasher';

export async function assertValidVerificationCode(
  verificationCodes: EmailVerificationCodeRepository,
  passwordHasher: PasswordHasher,
  email: string,
  code: string,
): Promise<void> {
  if (!code) {
    throw new InvalidVerificationCodeException();
  }

  const verification = await verificationCodes.findValidByEmail(email);
  if (!verification) {
    throw new InvalidVerificationCodeException();
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    await verificationCodes.invalidateByEmail(email);
    throw new VerificationCodeExpiredException();
  }

  if (!(await passwordHasher.matches(code, verification.codeHash))) {
    throw new InvalidVerificationCodeException();
  }
}
