import { AuthTokenResult } from '../../dto/auth-token.result';

export abstract class TokenIssuer {
  abstract issue(userId: string): Promise<AuthTokenResult>;
}
