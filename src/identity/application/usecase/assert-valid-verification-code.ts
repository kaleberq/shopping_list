import {
  InvalidVerificationCodeException,
  VerificationCodeExpiredException,
} from '../../domain/exception/identity.exceptions';
import { EmailVerificationCodeRepository } from '../port/out/email-verification-code.repository';
import { VerificationCodeHasher } from '../port/out/verification-code-hasher';

export async function assertValidVerificationCode(
  verificationCodes: EmailVerificationCodeRepository,
  codeHasher: VerificationCodeHasher,
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

  if (!(await codeHasher.matches(code, verification.codeHash))) {
    throw new InvalidVerificationCodeException();
  }
}
