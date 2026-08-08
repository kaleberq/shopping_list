export abstract class PasswordHasher {
  abstract hash(plain: string): Promise<string>;
  abstract matches(plain: string, hash: string): Promise<boolean>;
}
