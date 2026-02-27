import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import {
  type ITokenService,
  JwtPayload,
} from '../../../application/interfaces/token-service.interface';
import { AuthenticationError } from '../../../domain/errors/authentication.error';

type ResetPayload = {
  sub: string;
  type: 'reset';
};

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly configService: ConfigService) {}

  generateAccessToken(payload: JwtPayload): Promise<string> {
    const secret = this.getJwtSecret();
    const expiration = this.configService.get<string>('jwt.expiration', '15m');
    const expirationInSeconds = Math.floor(
      this.parseDurationToMs(expiration) / 1000,
    );

    return Promise.resolve(
      jwt.sign(payload, secret, {
        expiresIn: expirationInSeconds,
      }),
    );
  }

  generateRefreshToken(): Promise<{ token: string; expiresAt: Date }> {
    const token = randomBytes(48).toString('hex');
    const refreshExpiration = this.configService.get<string>(
      'jwt.refreshTokenExpiration',
      '30d',
    );

    const expiresAt = new Date(
      Date.now() + this.parseDurationToMs(refreshExpiration),
    );

    return Promise.resolve({ token, expiresAt });
  }

  generatePasswordResetToken(userId: string): Promise<string> {
    const secret = this.getJwtSecret();

    return Promise.resolve(
      jwt.sign(
        {
          sub: userId,
          type: 'reset',
        },
        secret,
        {
          expiresIn: 30 * 60,
        },
      ),
    );
  }

  verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.getJwtSecret());
      if (typeof decoded === 'string') {
        throw new AuthenticationError('Invalid token payload');
      }

      return Promise.resolve({
        sub: String(decoded.sub),
        email: String(decoded.email),
      });
    } catch {
      throw new AuthenticationError('Invalid access token');
    }
  }

  verifyPasswordResetToken(
    token: string,
  ): Promise<{ sub: string; type: 'reset' }> {
    try {
      const decoded = jwt.verify(token, this.getJwtSecret());
      if (typeof decoded === 'string') {
        throw new AuthenticationError('Invalid token payload');
      }

      const payload = decoded as ResetPayload;
      if (payload.type !== 'reset') {
        throw new AuthenticationError('Invalid reset token');
      }

      return Promise.resolve({
        sub: payload.sub,
        type: 'reset',
      });
    } catch {
      throw new AuthenticationError('Invalid reset token');
    }
  }

  private getJwtSecret(): string {
    const secret = this.configService.get<string>('jwt.secret', '');
    if (secret.length < 16) {
      throw new AuthenticationError('Invalid JWT secret configuration');
    }

    return secret;
  }

  private parseDurationToMs(duration: string): number {
    const match = duration.trim().match(/^(\d+)([smhd])$/i);
    if (match === null) {
      return 30 * 24 * 60 * 60 * 1000;
    }

    const value = Number.parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    if (unit === 's') {
      return value * 1000;
    }

    if (unit === 'm') {
      return value * 60 * 1000;
    }

    if (unit === 'h') {
      return value * 60 * 60 * 1000;
    }

    return value * 24 * 60 * 60 * 1000;
  }
}
