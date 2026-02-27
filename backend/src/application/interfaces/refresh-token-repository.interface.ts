import { RefreshTokenEntity } from '../../domain/entities/refresh-token.entity';

export const REFRESH_TOKEN_REPOSITORY = 'REFRESH_TOKEN_REPOSITORY';

export interface IRefreshTokenRepository {
  create(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshTokenEntity>;
  findByToken(token: string): Promise<RefreshTokenEntity | null>;
  deleteByToken(token: string): Promise<void>;
  deleteAllByUserId(userId: string): Promise<void>;
}
