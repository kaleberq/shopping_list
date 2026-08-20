import { User } from '../../../domain/model/user';

export abstract class UserRepository {
  abstract create(
    email: string,
    name: string,
    preferredCurrency: string,
  ): Promise<User>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract updateSettings(
    id: string,
    preferredCurrency: string,
    planId: string,
  ): Promise<User>;
}
