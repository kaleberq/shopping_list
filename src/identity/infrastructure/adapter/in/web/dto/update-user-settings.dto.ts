import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { PLAN_CODES_LIST } from '../../../../../domain/model/plan-codes';
import { SUPPORTED_CURRENCIES } from '../../../../../domain/model/supported-currencies';

export class UpdateUserSettingsDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([...SUPPORTED_CURRENCIES])
  preferredCurrency!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn([...PLAN_CODES_LIST])
  planCode!: string;
}
