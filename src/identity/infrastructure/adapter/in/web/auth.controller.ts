import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { LoginWithCodeUseCase } from '../../../../application/port/in/login-with-code.use-case';
import { RegisterWithCodeUseCase } from '../../../../application/port/in/register-with-code.use-case';
import { RequestAuthCodeUseCase } from '../../../../application/port/in/request-auth-code.use-case';
import { AuthExceptionFilter } from './auth.exception-filter';
import { LoginWithCodeDto } from './dto/login-with-code.dto';
import { RegisterWithCodeDto } from './dto/register-with-code.dto';
import { RequestAuthCodeDto } from './dto/request-auth-code.dto';

@Controller('auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(
    private readonly requestAuthCodeUseCase: RequestAuthCodeUseCase,
    private readonly registerWithCodeUseCase: RegisterWithCodeUseCase,
    private readonly loginWithCodeUseCase: LoginWithCodeUseCase,
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
}
