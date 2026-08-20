import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetCurrentUserUseCase } from '../application/port/in/get-current-user.use-case';
import { ListPlansUseCase } from '../application/port/in/list-plans.use-case';
import { LoginWithCodeUseCase } from '../application/port/in/login-with-code.use-case';
import { RegisterWithCodeUseCase } from '../application/port/in/register-with-code.use-case';
import { RequestAuthCodeUseCase } from '../application/port/in/request-auth-code.use-case';
import { UpdateUserSettingsUseCase } from '../application/port/in/update-user-settings.use-case';
import { EmailVerificationCodeRepository } from '../application/port/out/email-verification-code.repository';
import { PlanDefaultsEnsurer } from '../application/port/out/plan-defaults-ensurer';
import { PlanRepository } from '../application/port/out/plan.repository';
import { RegistrationVerificationSettings } from '../application/port/out/registration-verification.settings';
import { TokenIssuer } from '../application/port/out/token-issuer';
import { UserRepository } from '../application/port/out/user.repository';
import { VerificationCodeHasher } from '../application/port/out/verification-code-hasher';
import { VerificationCodeSender } from '../application/port/out/verification-code-sender';
import { GetCurrentUserUseCaseImpl } from '../application/usecase/get-current-user.use-case.impl';
import { ListPlansUseCaseImpl } from '../application/usecase/list-plans.use-case.impl';
import { LoginWithCodeUseCaseImpl } from '../application/usecase/login-with-code.use-case.impl';
import { RegisterWithCodeUseCaseImpl } from '../application/usecase/register-with-code.use-case.impl';
import { RequestAuthCodeUseCaseImpl } from '../application/usecase/request-auth-code.use-case.impl';
import { UpdateUserSettingsUseCaseImpl } from '../application/usecase/update-user-settings.use-case.impl';
import { AuthController } from './adapter/in/web/auth.controller';
import { NodemailerVerificationCodeSender } from './adapter/out/email/nodemailer-verification-code.sender';
import { EmailVerificationCodeOrmEntity } from './adapter/out/persistence/email-verification-code.orm-entity';
import { PlanOrmEntity } from './adapter/out/persistence/plan.orm-entity';
import { TypeOrmEmailVerificationCodeRepository } from './adapter/out/persistence/typeorm-email-verification-code.repository';
import { TypeOrmPlanRepository } from './adapter/out/persistence/typeorm-plan.repository';
import { TypeOrmUserRepository } from './adapter/out/persistence/typeorm-user.repository';
import { UserOrmEntity } from './adapter/out/persistence/user.orm-entity';
import { BcryptVerificationCodeHasher } from './adapter/out/security/bcrypt-verification-code-hasher';
import { JwtAuthGuard } from './adapter/out/security/jwt-auth.guard';
import { JwtStrategy } from './adapter/out/security/jwt.strategy';
import { JwtTokenIssuer } from './adapter/out/security/jwt-token-issuer';
import { PlanSeedService } from './config/plan-seed.service';
import { RegistrationVerificationSettingsAdapter } from './config/registration-verification-settings.adapter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      PlanOrmEntity,
      EmailVerificationCodeOrmEntity,
    ]),
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
    TypeOrmPlanRepository,
    { provide: PlanRepository, useExisting: TypeOrmPlanRepository },
    { provide: PlanDefaultsEnsurer, useExisting: TypeOrmPlanRepository },
    { provide: UserRepository, useClass: TypeOrmUserRepository },
    {
      provide: EmailVerificationCodeRepository,
      useClass: TypeOrmEmailVerificationCodeRepository,
    },
    {
      provide: VerificationCodeHasher,
      useClass: BcryptVerificationCodeHasher,
    },
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
      provide: RegisterWithCodeUseCase,
      useClass: RegisterWithCodeUseCaseImpl,
    },
    {
      provide: LoginWithCodeUseCase,
      useClass: LoginWithCodeUseCaseImpl,
    },
    {
      provide: GetCurrentUserUseCase,
      useClass: GetCurrentUserUseCaseImpl,
    },
    {
      provide: UpdateUserSettingsUseCase,
      useClass: UpdateUserSettingsUseCaseImpl,
    },
    {
      provide: ListPlansUseCase,
      useClass: ListPlansUseCaseImpl,
    },
    JwtStrategy,
    JwtAuthGuard,
    PlanSeedService,
  ],
  exports: [JwtModule, PassportModule],
})
export class IdentityModule {}
