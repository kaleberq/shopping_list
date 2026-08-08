import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { LoginWithCodeUseCase } from '../../../../application/port/in/login-with-code.use-case';
import { RequestAuthCodeUseCase } from '../../../../application/port/in/request-auth-code.use-case';
import { VerifyAuthCodeUseCase } from '../../../../application/port/in/verify-auth-code.use-case';
import { AuthExceptionFilter } from './auth.exception-filter';
import { LoginWithCodeDto } from './dto/login-with-code.dto';
import { RequestAuthCodeDto } from './dto/request-auth-code.dto';
import { VerifyAuthCodeDto } from './dto/verify-auth-code.dto';

@Controller('auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(
    private readonly requestAuthCodeUseCase: RequestAuthCodeUseCase,
    private readonly verifyAuthCodeUseCase: VerifyAuthCodeUseCase,
    private readonly loginWithCodeUseCase: LoginWithCodeUseCase,
  ) {}

  @Post('request-code')
  @HttpCode(HttpStatus.ACCEPTED)
  requestAuthCode(@Body() dto: RequestAuthCodeDto) {
    return this.requestAuthCodeUseCase.execute({ email: dto.email });
  }

  @Post('verify')
  @HttpCode(HttpStatus.CREATED)
  verifyAuthCode(@Body() dto: VerifyAuthCodeDto) {
    return this.verifyAuthCodeUseCase.execute({
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
