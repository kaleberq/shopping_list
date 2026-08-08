import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegistrationVerificationSettings } from '../../application/port/out/registration-verification.settings';

@Injectable()
export class RegistrationVerificationSettingsAdapter extends RegistrationVerificationSettings {
  constructor(private readonly config: ConfigService) {
    super();
  }

  codeExpirationMinutes(): number {
    return Number(this.config.get('VERIFICATION_CODE_EXPIRATION_MINUTES', '15'));
  }
}
