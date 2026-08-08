import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { RequestAuthCodeUseCase } from '../../../../application/port/in/request-auth-code.use-case';
import { VerifyAuthCodeUseCase } from '../../../../application/port/in/verify-auth-code.use-case';
import { AuthExceptionFilter } from './auth.exception-filter';
import { RequestAuthCodeDto } from './dto/request-auth-code.dto';
import { VerifyAuthCodeDto } from './dto/verify-auth-code.dto';

@Controller('auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(
    private readonly requestAuthCodeUseCase: RequestAuthCodeUseCase,
    private readonly verifyAuthCodeUseCase: VerifyAuthCodeUseCase,
  ) {}

  @Post('request-code')
  @HttpCode(HttpStatus.ACCEPTED)
  requestAuthCode(@Body() dto: RequestAuthCodeDto) {
    return this.requestAuthCodeUseCase.execute({ email: dto.email });
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  verifyAuthCode(@Body() dto: VerifyAuthCodeDto) {
    return this.verifyAuthCodeUseCase.execute({
      email: dto.email,
      code: dto.code,
      name: dto.name,
    });
  }
}
