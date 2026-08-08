import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class VerifyAuthCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be a 6-digit number' })
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}
