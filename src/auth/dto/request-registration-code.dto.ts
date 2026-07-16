import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestRegistrationCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
