import { IsEmail, IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class RequestAuthCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsIn(['login', 'register'])
  purpose?: 'login' | 'register';
}
