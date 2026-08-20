import { Injectable } from '@nestjs/common';
import {
  InvalidPlanCodeException,
  InvalidPreferredCurrencyException,
  UserNotFoundException,
} from '../../domain/exception/identity.exceptions';
import { isPlanCode } from '../../domain/model/plan-codes';
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

  async execute(
    command: UpdateUserSettingsCommand,
  ): Promise<UserProfileResult> {
    const preferredCurrency = AuthInputValidator.normalizeCurrency(
      command.preferredCurrency,
    );
    const planCode = (command.planCode ?? '').trim().toLowerCase();
    AuthInputValidator.validatePreferredCurrency(preferredCurrency);
    if (!isSupportedCurrency(preferredCurrency)) {
      throw new InvalidPreferredCurrencyException();
    }
    if (!planCode) {
      throw new InvalidPlanCodeException();
    }
    if (!isPlanCode(planCode)) {
      throw new InvalidPlanCodeException();
    }

    const existing = await this.users.findById(command.userId);
    if (!existing) {
      throw new UserNotFoundException();
    }

    const updated = await this.users.updateSettings(
      command.userId,
      preferredCurrency,
      planCode,
    );
    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      preferredCurrency: updated.preferredCurrency,
      plan: {
        code: updated.planCode,
        name: updated.planName,
      },
    };
  }
}
