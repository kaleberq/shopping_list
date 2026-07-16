import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ConfirmRegistrationDto } from './dto/confirm-registration.dto';
import { LoginDto } from './dto/login.dto';
import { RequestRegistrationCodeDto } from './dto/request-registration-code.dto';
import { EmailVerificationCode } from './entities/email-verification-code.entity';
import { User } from './entities/user.entity';
import {
  EmailAlreadyInUseException,
  InvalidCredentialsException,
  InvalidVerificationCodeException,
  VerificationCodeExpiredException,
} from './exceptions/auth.exceptions';
import { MailService } from './mail.service';

export type AuthTokenResult = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(EmailVerificationCode)
    private readonly verificationCodes: Repository<EmailVerificationCode>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async requestRegistrationCode(
    dto: RequestRegistrationCodeDto,
  ): Promise<{ message: string }> {
    const email = this.normalizeEmail(dto.email);
    this.validateEmail(email);

    if (await this.users.existsBy({ email })) {
      throw new EmailAlreadyInUseException(email);
    }

    const plainCode = this.generateSixDigitCode();
    const expirationMinutes = Math.max(
      Number(this.config.get('VERIFICATION_CODE_EXPIRATION_MINUTES', '15')),
      1,
    );
    const expiresAt = new Date(Date.now() + expirationMinutes * 60_000);

    await this.verificationCodes.save({
      email,
      codeHash: await bcrypt.hash(plainCode, 10),
      expiresAt,
    });

    await this.mailService.sendVerificationCode(email, plainCode);
    return { message: 'Verification code sent to your email' };
  }

  async confirmRegistration(dto: ConfirmRegistrationDto): Promise<AuthTokenResult> {
    const email = this.normalizeEmail(dto.email);
    const code = dto.code.trim();
    this.validateRegistration(email, dto.name, dto.password);

    if (!code) {
      throw new InvalidVerificationCodeException();
    }

    const verification = await this.verificationCodes.findOne({ where: { email } });
    if (!verification) {
      throw new InvalidVerificationCodeException();
    }

    if (verification.expiresAt.getTime() < Date.now()) {
      await this.verificationCodes.delete({ email });
      throw new VerificationCodeExpiredException();
    }

    const codeMatches = await bcrypt.compare(code, verification.codeHash);
    if (!codeMatches) {
      throw new InvalidVerificationCodeException();
    }

    if (await this.users.existsBy({ email })) {
      await this.verificationCodes.delete({ email });
      throw new EmailAlreadyInUseException(email);
    }

    const user = this.users.create({
      email,
      name: dto.name.trim(),
      passwordHash: await bcrypt.hash(dto.password, 10),
    });
    const saved = await this.users.save(user);
    await this.verificationCodes.delete({ email });

    return this.issueToken(saved.id);
  }

  async login(dto: LoginDto): Promise<AuthTokenResult> {
    const email = this.normalizeEmail(dto.email);
    if (!email || !dto.password?.trim()) {
      throw new InvalidCredentialsException();
    }

    const user = await this.users.findOne({ where: { email } });
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new InvalidCredentialsException();
    }

    return this.issueToken(user.id);
  }

  private async issueToken(userId: string): Promise<AuthTokenResult> {
    const expiresMinutes = Number(this.config.get('JWT_EXPIRATION_MINUTES', '60'));
    const expiresInSeconds = expiresMinutes * 60;
    const accessToken = await this.jwtService.signAsync(
      { sub: String(userId) },
      { expiresIn: expiresInSeconds },
    );
    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: expiresInSeconds,
    };
  }

  private normalizeEmail(email: string): string {
    return (email ?? '').trim().toLowerCase();
  }

  private validateEmail(email: string): void {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email');
    }
  }

  private validateRegistration(email: string, name: string, password: string): void {
    this.validateEmail(email);
    if (!name?.trim()) {
      throw new Error('Name is required');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
  }

  private generateSixDigitCode(): string {
    return String(randomInt(0, 1_000_000)).padStart(6, '0');
  }
}
