export class RegistrationInputValidator {
  static normalizeEmail(email: string): string {
    return (email ?? '').trim().toLowerCase();
  }

  static validateEmail(email: string): void {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email');
    }
  }

  static validate(email: string, name: string, password: string): void {
    this.validateEmail(email);
    if (!name?.trim()) {
      throw new Error('Name is required');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
  }
}
