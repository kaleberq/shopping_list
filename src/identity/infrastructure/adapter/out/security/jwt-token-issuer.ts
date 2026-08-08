import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenResult } from '../../../../application/dto/auth-token.result';
import { TokenIssuer } from '../../../../application/port/out/token-issuer';

@Injectable()
export class JwtTokenIssuer extends TokenIssuer {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async issue(userId: string): Promise<AuthTokenResult> {
    const expiresMinutes = Number(
      this.config.get('JWT_EXPIRATION_MINUTES', '60'),
    );
    const expiresIn = expiresMinutes * 60;
    const accessToken = await this.jwtService.signAsync(
      { sub: String(userId) },
      { expiresIn },
    );
    return { accessToken, tokenType: 'Bearer', expiresIn };
  }
}
