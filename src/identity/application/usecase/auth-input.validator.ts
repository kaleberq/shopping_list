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

  static validatePreferredCurrency(currency: string): void {
    const normalized = (currency ?? '').trim().toUpperCase();
    if (!normalized) {
      throw new Error('Preferred currency is required');
    }
    // Lazy import avoided — keep validator independent; use case checks supported list
    if (!/^[A-Z]{3}$/.test(normalized)) {
      throw new Error('Invalid preferred currency');
    }
  }

  static normalizeCurrency(currency: string): string {
    return (currency ?? '').trim().toUpperCase();
  }

  static defaultNameFromEmail(email: string): string {
    const local = email.split('@')[0]?.trim();
    return local && local.length > 0 ? local : email;
  }
}
