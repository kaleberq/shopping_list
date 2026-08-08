import { User } from '../../../domain/model/user';

export abstract class UserRepository {
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract create(
    email: string,
    name: string,
    passwordHash: string,
  ): Promise<User>;
  abstract findByEmailWithPasswordHash(
    email: string,
  ): Promise<{ user: User; passwordHash: string } | null>;
}
