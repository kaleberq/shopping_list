import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { VerificationCodeHasher } from '../../../../application/port/out/verification-code-hasher';

@Injectable()
export class BcryptVerificationCodeHasher extends VerificationCodeHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  matches(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
