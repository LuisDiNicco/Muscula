import { Injectable } from '@nestjs/common';
import {
  type AchievementUserStats,
  type AchievementWithStatus,
  type IAchievementRepository,
} from '../../../../application/interfaces/achievement-repository.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaAchievementRepository implements IAchievementRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getAchievementsWithStatus(
    userId: string,
  ): Promise<AchievementWithStatus[]> {
    const rows = await this.prismaService.achievement.findMany({
      include: {
        users: {
          where: { userId },
          select: { unlockedAt: true },
          take: 1,
        },
      },
      orderBy: {
        titleEs: 'asc',
      },
    });

    return rows.map((row) => ({
      id: row.id,
      code: row.code,
      titleEs: row.titleEs,
      titleEn: row.titleEn,
      descriptionEs: row.descriptionEs,
      descriptionEn: row.descriptionEn,
      iconUrl: row.iconUrl,
      condition: row.condition,
      unlockedAt: row.users[0]?.unlockedAt ?? null,
    }));
  }

  async getUserStats(userId: string): Promise<AchievementUserStats> {
    const [
      completedSessions,
      completedSessionRows,
      nutritionRows,
      weightRows,
      photo,
    ] = await Promise.all([
      this.prismaService.session.count({
        where: {
          userId,
          status: 'COMPLETED',
          deletedAt: null,
        },
      }),
      this.prismaService.session.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          deletedAt: null,
        },
        select: {
          finishedAt: true,
          startedAt: true,
        },
        distinct: ['startedAt'],
      }),
      this.prismaService.meal.findMany({
        where: {
          userId,
          entries: {
            some: {},
          },
        },
        select: {
          date: true,
        },
        distinct: ['date'],
      }),
      this.prismaService.bodyMetric.findMany({
        where: {
          userId,
          weightKg: {
            not: null,
          },
        },
        select: {
          date: true,
        },
        distinct: ['date'],
      }),
      this.prismaService.progressPhoto.findFirst({
        where: { userId },
        select: { id: true },
      }),
    ]);

    return {
      completedSessions,
      completedSessionDates: completedSessionRows.map(
        (row) => row.finishedAt ?? row.startedAt,
      ),
      nutritionLogDates: nutritionRows.map((row) => row.date),
      weightLogDates: weightRows.map((row) => row.date),
      hasProgressPhoto: photo !== null,
    };
  }

  async unlockByCodes(userId: string, codes: string[]): Promise<void> {
    if (codes.length === 0) {
      return;
    }

    const achievements = await this.prismaService.achievement.findMany({
      where: {
        code: { in: codes },
      },
      select: {
        id: true,
      },
    });

    await this.prismaService.userAchievement.createMany({
      data: achievements.map((achievement) => ({
        userId,
        achievementId: achievement.id,
      })),
      skipDuplicates: true,
    });
  }
}
