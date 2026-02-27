import { Injectable } from '@nestjs/common';
import { IRefreshTokenRepository } from '../../../../application/interfaces/refresh-token-repository.interface';
import { RefreshTokenEntity } from '../../../../domain/entities/refresh-token.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshTokenEntity> {
    const created = await this.prismaService.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });

    return new RefreshTokenEntity({
      id: created.id,
      userId: created.userId,
      token: created.token,
      expiresAt: created.expiresAt,
      createdAt: created.createdAt,
    });
  }

  async findByToken(token: string): Promise<RefreshTokenEntity | null> {
    const refreshToken = await this.prismaService.refreshToken.findUnique({
      where: {
        token,
      },
    });

    if (refreshToken === null) {
      return null;
    }

    return new RefreshTokenEntity({
      id: refreshToken.id,
      userId: refreshToken.userId,
      token: refreshToken.token,
      expiresAt: refreshToken.expiresAt,
      createdAt: refreshToken.createdAt,
    });
  }

  async deleteByToken(token: string): Promise<void> {
    await this.prismaService.refreshToken.deleteMany({
      where: {
        token,
      },
    });
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prismaService.refreshToken.deleteMany({
      where: {
        userId,
      },
    });
  }
}
