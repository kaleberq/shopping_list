import { Injectable } from '@nestjs/common';
import {
  InvalidPreferredCurrencyException,
  UserNotFoundException,
} from '../../domain/exception/identity.exceptions';
import { isSupportedCurrency } from '../../domain/model/supported-currencies';
import { UpdateUserSettingsCommand } from '../dto/update-user-settings.command';
import { UserProfileResult } from '../dto/user-profile.result';
import { UpdateUserSettingsUseCase } from '../port/in/update-user-settings.use-case';
import { UserRepository } from '../port/out/user.repository';
import { AuthInputValidator } from './auth-input.validator';

@Injectable()
export class UpdateUserSettingsUseCaseImpl extends UpdateUserSettingsUseCase {
  constructor(private readonly users: UserRepository) {
    super();
  }

  async execute(command: UpdateUserSettingsCommand): Promise<UserProfileResult> {
    const preferredCurrency = AuthInputValidator.normalizeCurrency(
      command.preferredCurrency,
    );
    AuthInputValidator.validatePreferredCurrency(preferredCurrency);
    if (!isSupportedCurrency(preferredCurrency)) {
      throw new InvalidPreferredCurrencyException();
    }

    const existing = await this.users.findById(command.userId);
    if (!existing) {
      throw new UserNotFoundException();
    }

    const updated = await this.users.updatePreferredCurrency(
      command.userId,
      preferredCurrency,
    );
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      preferredCurrency: updated.preferredCurrency,
    };
  }
}
