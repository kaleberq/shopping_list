import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestAuthCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
