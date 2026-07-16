import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseFilters,
} from '@nestjs/common';
import { AuthExceptionFilter } from './auth.exception-filter';
import { AuthService } from './auth.service';
import { ConfirmRegistrationDto } from './dto/confirm-registration.dto';
import { LoginDto } from './dto/login.dto';
import { RequestRegistrationCodeDto } from './dto/request-registration-code.dto';

@Controller('auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/request-code')
  @HttpCode(HttpStatus.ACCEPTED)
  requestRegistrationCode(@Body() dto: RequestRegistrationCodeDto) {
    return this.authService.requestRegistrationCode(dto);
  }

  @Post('register/confirm')
  @HttpCode(HttpStatus.CREATED)
  confirmRegistration(@Body() dto: ConfirmRegistrationDto) {
    return this.authService.confirmRegistration(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
