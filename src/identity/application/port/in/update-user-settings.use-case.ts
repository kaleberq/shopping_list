import { UserProfileResult } from '../../dto/user-profile.result';
import { UpdateUserSettingsCommand } from '../../dto/update-user-settings.command';

export abstract class UpdateUserSettingsUseCase {
  abstract execute(
    command: UpdateUserSettingsCommand,
  ): Promise<UserProfileResult>;
}
