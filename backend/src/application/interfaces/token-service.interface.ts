export const TOKEN_SERVICE = 'TOKEN_SERVICE';

export type JwtPayload = {
  sub: string;
  email: string;
};

export interface ITokenService {
  generateAccessToken(payload: JwtPayload): Promise<string>;
  generateRefreshToken(): Promise<{ token: string; expiresAt: Date }>;
  generatePasswordResetToken(userId: string): Promise<string>;
  verifyAccessToken(token: string): Promise<JwtPayload>;
  verifyPasswordResetToken(
    token: string,
  ): Promise<{ sub: string; type: 'reset' }>;
}
