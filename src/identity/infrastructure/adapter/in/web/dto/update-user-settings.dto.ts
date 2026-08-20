import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { SUPPORTED_CURRENCIES } from '../../../../../domain/model/supported-currencies';

export class UpdateUserSettingsDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([...SUPPORTED_CURRENCIES])
  preferredCurrency!: string;

  @IsString()
  @IsNotEmpty()
  planId!: string;
}
