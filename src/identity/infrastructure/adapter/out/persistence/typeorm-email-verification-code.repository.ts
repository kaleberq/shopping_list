import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerificationCode } from '../../../../application/dto/email-verification-code';
import { EmailVerificationCodeRepository } from '../../../../application/port/out/email-verification-code.repository';
import { EmailVerificationCodeOrmEntity } from './email-verification-code.orm-entity';

@Injectable()
export class TypeOrmEmailVerificationCodeRepository extends EmailVerificationCodeRepository {
  constructor(
    @InjectRepository(EmailVerificationCodeOrmEntity)
    private readonly codes: Repository<EmailVerificationCodeOrmEntity>,
  ) {
    super();
  }

  async save(code: EmailVerificationCode): Promise<void> {
    await this.codes.save({
      email: code.email,
      codeHash: code.codeHash,
      expiresAt: code.expiresAt,
    });
  }

  async findByEmail(email: string): Promise<EmailVerificationCode | null> {
    const row = await this.codes.findOne({ where: { email } });
    if (!row) {
      return null;
    }
    return {
      email: row.email,
      codeHash: row.codeHash,
      expiresAt: row.expiresAt,
    };
  }

  async deleteByEmail(email: string): Promise<void> {
    await this.codes.delete({ email });
  }
}
