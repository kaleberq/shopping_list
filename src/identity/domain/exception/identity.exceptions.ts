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

export class EmailAlreadyInUseException extends Error {
  constructor() {
    super('Email already in use');
    this.name = 'EmailAlreadyInUseException';
  }
}

export class InvalidPreferredCurrencyException extends Error {
  constructor() {
    super('Invalid preferred currency');
    this.name = 'InvalidPreferredCurrencyException';
  }
}

export class InvalidPlanCodeException extends Error {
  constructor() {
    super('Invalid plan code');
    this.name = 'InvalidPlanCodeException';
  }
}

export class EmailNotFoundException extends Error {
  constructor() {
    super('Email not found');
    this.name = 'EmailNotFoundException';
  }
}

export class UserNotFoundException extends Error {
  constructor() {
    super('User not found');
    this.name = 'UserNotFoundException';
  }
}

export class InvalidEmailException extends Error {
  constructor() {
    super('Invalid email');
    this.name = 'InvalidEmailException';
  }
}

export class NameRequiredException extends Error {
  constructor() {
    super('Name is required');
    this.name = 'NameRequiredException';
  }
}

export class PreferredCurrencyRequiredException extends Error {
  constructor() {
    super('Preferred currency is required');
    this.name = 'PreferredCurrencyRequiredException';
  }
}
