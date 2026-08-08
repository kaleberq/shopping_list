import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasher } from '../../../../application/port/out/password-hasher';

@Injectable()
export class BcryptPasswordHasher extends PasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 10);
  }

  matches(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
