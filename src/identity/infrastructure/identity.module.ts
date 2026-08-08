import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestAuthCodeUseCase } from '../application/port/in/request-auth-code.use-case';
import { VerifyAuthCodeUseCase } from '../application/port/in/verify-auth-code.use-case';
import { EmailVerificationCodeRepository } from '../application/port/out/email-verification-code.repository';
import { PasswordHasher } from '../application/port/out/password-hasher';
import { RegistrationVerificationSettings } from '../application/port/out/registration-verification.settings';
import { TokenIssuer } from '../application/port/out/token-issuer';
import { UserRepository } from '../application/port/out/user.repository';
import { VerificationCodeSender } from '../application/port/out/verification-code-sender';
import { RequestAuthCodeUseCaseImpl } from '../application/usecase/request-auth-code.use-case.impl';
import { VerifyAuthCodeUseCaseImpl } from '../application/usecase/verify-auth-code.use-case.impl';
import { AuthController } from './adapter/in/web/auth.controller';
import { NodemailerVerificationCodeSender } from './adapter/out/email/nodemailer-verification-code.sender';
import { EmailVerificationCodeOrmEntity } from './adapter/out/persistence/email-verification-code.orm-entity';
import { TypeOrmEmailVerificationCodeRepository } from './adapter/out/persistence/typeorm-email-verification-code.repository';
import { TypeOrmUserRepository } from './adapter/out/persistence/typeorm-user.repository';
import { UserOrmEntity } from './adapter/out/persistence/user.orm-entity';
import { BcryptPasswordHasher } from './adapter/out/security/bcrypt-password-hasher';
import { JwtStrategy } from './adapter/out/security/jwt.strategy';
import { JwtTokenIssuer } from './adapter/out/security/jwt-token-issuer';
import { RegistrationVerificationSettingsAdapter } from './config/registration-verification-settings.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserOrmEntity, EmailVerificationCodeOrmEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(
          'JWT_SECRET',
          'dev-only-change-in-production-use-at-least-32-chars',
        ),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: UserRepository, useClass: TypeOrmUserRepository },
    {
      provide: EmailVerificationCodeRepository,
      useClass: TypeOrmEmailVerificationCodeRepository,
    },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    { provide: TokenIssuer, useClass: JwtTokenIssuer },
    {
      provide: VerificationCodeSender,
      useClass: NodemailerVerificationCodeSender,
    },
    {
      provide: RegistrationVerificationSettings,
      useClass: RegistrationVerificationSettingsAdapter,
    },
    {
      provide: RequestAuthCodeUseCase,
      useClass: RequestAuthCodeUseCaseImpl,
    },
    {
      provide: VerifyAuthCodeUseCase,
      useClass: VerifyAuthCodeUseCaseImpl,
    },
    JwtStrategy,
  ],
  exports: [JwtModule, PassportModule],
})
export class IdentityModule {}
