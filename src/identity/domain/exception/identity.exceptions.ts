export class InvalidVerificationCodeException extends Error {
  constructor() {
    super('Invalid or expired verification code');
    this.name = 'InvalidVerificationCodeException';
  }
}

export class VerificationCodeExpiredException extends Error {
  constructor() {
    super('Verification code has expired');
    this.name = 'VerificationCodeExpiredException';
  }
}

export class EmailDeliveryException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailDeliveryException';
  }
}
