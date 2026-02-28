export const ACHIEVEMENT_REPOSITORY = 'ACHIEVEMENT_REPOSITORY';

export type AchievementWithStatus = {
  id: string;
  code: string;
  titleEs: string;
  titleEn: string;
  descriptionEs: string;
  descriptionEn: string;
  iconUrl: string;
  condition: string;
  unlockedAt: Date | null;
};

export type AchievementUserStats = {
  completedSessions: number;
  completedSessionDates: Date[];
  nutritionLogDates: Date[];
  weightLogDates: Date[];
  hasProgressPhoto: boolean;
};

export interface IAchievementRepository {
  getAchievementsWithStatus(userId: string): Promise<AchievementWithStatus[]>;
  getUserStats(userId: string): Promise<AchievementUserStats>;
  unlockByCodes(userId: string, codes: string[]): Promise<void>;
}
