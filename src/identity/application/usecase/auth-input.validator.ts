export class AuthInputValidator {
  static normalizeEmail(email: string): string {
    return (email ?? '').trim().toLowerCase();
  }

  static validateEmail(email: string): void {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email');
    }
  }

  static validateName(name: string): void {
    if (!name?.trim()) {
      throw new Error('Name is required');
    }
  }

  static defaultNameFromEmail(email: string): string {
    const local = email.split('@')[0]?.trim();
    return local && local.length > 0 ? local : email;
  }
}
