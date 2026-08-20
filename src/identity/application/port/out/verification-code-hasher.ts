export abstract class VerificationCodeHasher {
  abstract hash(plain: string): Promise<string>;
  abstract matches(plain: string, hash: string): Promise<boolean>;
}
