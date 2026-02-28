import { Inject, Injectable } from '@nestjs/common';
import {
  ACHIEVEMENT_REPOSITORY,
  type AchievementWithStatus,
  type IAchievementRepository,
} from '../interfaces/achievement-repository.interface';

export type AchievementEvent =
  | 'SESSION_COMPLETED'
  | 'MESOCYCLE_COMPLETED'
  | 'NUTRITION_LOGGED'
  | 'WEIGHT_LOGGED'
  | 'PROGRESS_PHOTO_UPLOADED'
  | 'PR_ACHIEVED';

@Injectable()
export class AchievementService {
  constructor(
    @Inject(ACHIEVEMENT_REPOSITORY)
    private readonly achievementRepository: IAchievementRepository,
  ) {}

  async getAchievements(userId: string): Promise<AchievementWithStatus[]> {
    const achievements =
      await this.achievementRepository.getAchievementsWithStatus(userId);

    return achievements.sort((left, right) => {
      if (left.unlockedAt === null && right.unlockedAt !== null) {
        return 1;
      }

      if (left.unlockedAt !== null && right.unlockedAt === null) {
        return -1;
      }

      if (left.unlockedAt !== null && right.unlockedAt !== null) {
        return right.unlockedAt.getTime() - left.unlockedAt.getTime();
      }

      return left.titleEs.localeCompare(right.titleEs);
    });
  }

  async evaluateAchievements(
    userId: string,
    event: AchievementEvent,
  ): Promise<string[]> {
    const achievements = await this.getAchievements(userId);
    const lockedCodes = new Set(
      achievements
        .filter((achievement) => achievement.unlockedAt === null)
        .map((achievement) => achievement.code),
    );

    if (lockedCodes.size === 0) {
      return [];
    }

    const stats = await this.achievementRepository.getUserStats(userId);
    const unlockCodes = new Set<string>();

    if (
      lockedCodes.has('FIRST_SESSION') &&
      stats.completedSessions >= 1 &&
      event === 'SESSION_COMPLETED'
    ) {
      unlockCodes.add('FIRST_SESSION');
    }

    if (
      lockedCodes.has('SESSIONS_25') &&
      stats.completedSessions >= 25 &&
      event === 'SESSION_COMPLETED'
    ) {
      unlockCodes.add('SESSIONS_25');
    }

    if (
      lockedCodes.has('SESSIONS_100') &&
      stats.completedSessions >= 100 &&
      event === 'SESSION_COMPLETED'
    ) {
      unlockCodes.add('SESSIONS_100');
    }

    if (
      lockedCodes.has('STREAK_7') &&
      this.getLongestDailyStreak(stats.completedSessionDates) >= 7 &&
      event === 'SESSION_COMPLETED'
    ) {
      unlockCodes.add('STREAK_7');
    }

    if (
      lockedCodes.has('CONSISTENCY_12_WEEKS') &&
      this.hasWeeklyConsistency(stats.completedSessionDates, 12, 3) &&
      event === 'SESSION_COMPLETED'
    ) {
      unlockCodes.add('CONSISTENCY_12_WEEKS');
    }

    if (
      lockedCodes.has('NUTRITION_STREAK_7') &&
      this.getLongestDailyStreak(stats.nutritionLogDates) >= 7 &&
      event === 'NUTRITION_LOGGED'
    ) {
      unlockCodes.add('NUTRITION_STREAK_7');
    }

    if (
      lockedCodes.has('WEIGHT_LOGGER_30') &&
      this.getLongestDailyStreak(stats.weightLogDates) >= 30 &&
      event === 'WEIGHT_LOGGED'
    ) {
      unlockCodes.add('WEIGHT_LOGGER_30');
    }

    if (
      lockedCodes.has('FIRST_PROGRESS_PHOTO') &&
      stats.hasProgressPhoto &&
      event === 'PROGRESS_PHOTO_UPLOADED'
    ) {
      unlockCodes.add('FIRST_PROGRESS_PHOTO');
    }

    if (
      lockedCodes.has('MESOCYCLE_COMPLETE') &&
      event === 'MESOCYCLE_COMPLETED'
    ) {
      unlockCodes.add('MESOCYCLE_COMPLETE');
    }

    if (lockedCodes.has('FIRST_PR') && event === 'PR_ACHIEVED') {
      unlockCodes.add('FIRST_PR');
    }

    const codes = [...unlockCodes];
    if (codes.length > 0) {
      await this.achievementRepository.unlockByCodes(userId, codes);
    }

    return codes;
  }

  private getLongestDailyStreak(dates: Date[]): number {
    if (dates.length === 0) {
      return 0;
    }

    const sortedDays = [
      ...new Set(dates.map((date) => this.toDayKey(date))),
    ].sort();

    let longest = 1;
    let current = 1;

    for (let index = 1; index < sortedDays.length; index += 1) {
      const previous = new Date(`${sortedDays[index - 1]}T00:00:00.000Z`);
      const currentDay = new Date(`${sortedDays[index]}T00:00:00.000Z`);
      const dayDiff =
        (currentDay.getTime() - previous.getTime()) / (24 * 60 * 60 * 1000);

      if (dayDiff === 1) {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    return longest;
  }

  private hasWeeklyConsistency(
    dates: Date[],
    requiredWeeks: number,
    minSessionsPerWeek: number,
  ): boolean {
    const weekMap = new Map<string, number>();

    for (const date of dates) {
      const weekKey = this.toIsoWeekKey(date);
      weekMap.set(weekKey, (weekMap.get(weekKey) ?? 0) + 1);
    }

    const qualifyingWeeks = [...weekMap.values()].filter(
      (count) => count >= minSessionsPerWeek,
    ).length;

    return qualifyingWeeks >= requiredWeeks;
  }

  private toDayKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private toIsoWeekKey(input: Date): string {
    const date = new Date(
      Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()),
    );
    const day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);

    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );

    return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }
}
