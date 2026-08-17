import { Injectable } from '@nestjs/common';
import { UserNotFoundException } from '../../domain/exception/identity.exceptions';
import { UserProfileResult } from '../dto/user-profile.result';
import { GetCurrentUserUseCase } from '../port/in/get-current-user.use-case';
import { UserRepository } from '../port/out/user.repository';

@Injectable()
export class GetCurrentUserUseCaseImpl extends GetCurrentUserUseCase {
  constructor(private readonly users: UserRepository) {
    super();
  }

  async execute(userId: string): Promise<UserProfileResult> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }
    return toProfile(user);
  }
}

function toProfile(user: {
  id: string;
  email: string;
  name: string;
  preferredCurrency: string;
  planCode: string;
  planName: string;
}): UserProfileResult {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    preferredCurrency: user.preferredCurrency,
    plan: {
      code: user.planCode,
      name: user.planName,
    },
  };
}
