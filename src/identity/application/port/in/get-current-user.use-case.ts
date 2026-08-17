import { UserProfileResult } from '../../dto/user-profile.result';

export abstract class GetCurrentUserUseCase {
  abstract execute(userId: string): Promise<UserProfileResult>;
}
