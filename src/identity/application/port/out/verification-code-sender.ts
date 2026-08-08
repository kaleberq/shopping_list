export abstract class VerificationCodeSender {
  abstract send(email: string, code: string): Promise<void>;
}
