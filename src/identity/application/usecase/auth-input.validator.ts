import {
  InvalidEmailException,
  InvalidPreferredCurrencyException,
  NameRequiredException,
  PreferredCurrencyRequiredException,
} from '../../domain/exception/identity.exceptions';

export class AuthInputValidator {
  static normalizeEmail(email: string): string {
    return (email ?? '').trim().toLowerCase();
  }

  static validateEmail(email: string): void {
    if (!email || !email.includes('@')) {
      throw new InvalidEmailException();
    }
  }

  static validateName(name: string): void {
    if (!name?.trim()) {
      throw new NameRequiredException();
    }
  }

  static validatePreferredCurrency(currency: string): void {
    const normalized = (currency ?? '').trim().toUpperCase();
    if (!normalized) {
      throw new PreferredCurrencyRequiredException();
    }
    if (!/^[A-Z]{3}$/.test(normalized)) {
      throw new InvalidPreferredCurrencyException();
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
