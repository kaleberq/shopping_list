import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { GetCurrentUserUseCase } from '../../../../application/port/in/get-current-user.use-case';
import { ListPlansUseCase } from '../../../../application/port/in/list-plans.use-case';
import { LoginWithCodeUseCase } from '../../../../application/port/in/login-with-code.use-case';
import { RegisterWithCodeUseCase } from '../../../../application/port/in/register-with-code.use-case';
import { RequestAuthCodeUseCase } from '../../../../application/port/in/request-auth-code.use-case';
import { UpdateUserSettingsUseCase } from '../../../../application/port/in/update-user-settings.use-case';
import { SUPPORTED_CURRENCIES } from '../../../../domain/model/supported-currencies';
import { JwtAuthGuard } from '../../out/security/jwt-auth.guard';
import { AuthExceptionFilter } from './auth.exception-filter';
import { LoginWithCodeDto } from './dto/login-with-code.dto';
import { RegisterWithCodeDto } from './dto/register-with-code.dto';
import { RequestAuthCodeDto } from './dto/request-auth-code.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

type AuthenticatedRequest = Request & {
  user: { userId: string };
};

@Controller('auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(
    private readonly requestAuthCodeUseCase: RequestAuthCodeUseCase,
    private readonly registerWithCodeUseCase: RegisterWithCodeUseCase,
    private readonly loginWithCodeUseCase: LoginWithCodeUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly updateUserSettingsUseCase: UpdateUserSettingsUseCase,
    private readonly listPlansUseCase: ListPlansUseCase,
  ) {}

  @Post('request-code')
  @HttpCode(HttpStatus.ACCEPTED)
  requestAuthCode(@Body() dto: RequestAuthCodeDto) {
    return this.requestAuthCodeUseCase.execute({
      email: dto.email,
      purpose: dto.purpose,
    });
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterWithCodeDto) {
    return this.registerWithCodeUseCase.execute({
      email: dto.email,
      code: dto.code,
      name: dto.name,
      preferredCurrency: dto.preferredCurrency,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginWithCodeDto) {
    return this.loginWithCodeUseCase.execute({
      email: dto.email,
      code: dto.code,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Req() req: AuthenticatedRequest) {
    return this.getCurrentUserUseCase.execute(req.user.userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateSettings(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateUserSettingsDto,
  ) {
    return this.updateUserSettingsUseCase.execute({
      userId: req.user.userId,
      preferredCurrency: dto.preferredCurrency,
      planId: dto.planId,
    });
  }

  @Get('plans')
  listPlans() {
    return this.listPlansUseCase.execute();
  }

  @Get('currencies')
  listSupportedCurrencies() {
    return { currencies: [...SUPPORTED_CURRENCIES] };
  }
}
