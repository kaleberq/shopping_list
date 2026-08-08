import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { ConfirmRegistrationUseCase } from '../../../../application/port/in/confirm-registration.use-case';
import { LoginUserUseCase } from '../../../../application/port/in/login-user.use-case';
import { RequestRegistrationCodeUseCase } from '../../../../application/port/in/request-registration-code.use-case';
import { AuthExceptionFilter } from './auth.exception-filter';
import { ConfirmRegistrationDto } from './dto/confirm-registration.dto';
import { LoginDto } from './dto/login.dto';
import { RequestRegistrationCodeDto } from './dto/request-registration-code.dto';

@Controller('auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(
    private readonly requestRegistrationCodeUseCase: RequestRegistrationCodeUseCase,
    private readonly confirmRegistrationUseCase: ConfirmRegistrationUseCase,
    private readonly loginUserUseCase: LoginUserUseCase,
  ) {}

  @Post('register/request-code')
  @HttpCode(HttpStatus.ACCEPTED)
  requestRegistrationCode(@Body() dto: RequestRegistrationCodeDto) {
    return this.requestRegistrationCodeUseCase.execute({ email: dto.email });
  }

  @Post('register/confirm')
  @HttpCode(HttpStatus.CREATED)
  confirmRegistration(@Body() dto: ConfirmRegistrationDto) {
    return this.confirmRegistrationUseCase.execute({
      email: dto.email,
      code: dto.code,
      name: dto.name,
      password: dto.password,
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.loginUserUseCase.execute({
      email: dto.email,
      password: dto.password,
    });
  }
}
