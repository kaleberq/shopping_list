import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginWithCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be a 6-digit number' })
  code!: string;
}
