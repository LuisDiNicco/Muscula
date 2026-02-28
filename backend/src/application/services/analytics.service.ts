import { Inject, Injectable } from '@nestjs/common';
import {
  AnalyticsPeriod,
  ANALYTICS_REPOSITORY,
  CorrelationType,
  MuscleHeatmapSnapshot,
  MuscleOneRmWeeklyPoint,
} from '../interfaces/analytics-repository.interface';
import type { IAnalyticsRepository } from '../interfaces/analytics-repository.interface';
import { MuscleGroup } from '../../domain/enums';
import { VolumeTrackerService } from './volume-tracker.service';

export type DeloadCheckResult = {
  needsDeload: boolean;
  reasons: string[];
  affectedMuscles: MuscleGroup[];
  readinessAverageLast14Days: number | null;
};

export type HeatmapRecovery = 'FRESH' | 'RECENT' | 'FATIGUED' | 'STALE';

export type HeatmapItem = {
  muscleGroup: MuscleGroup;
  lastTrainedAt: Date | null;
  effectiveSetsThisWeek: number;
  recovery: HeatmapRecovery;
};

export type StrengthTrendPoint = {
  date: Date;
  estimatedOneRm: number;
};

export type TonnageTrendPoint = {
  date: Date;
  tonnage: number;
};

export type PersonalRecordsResult = {
  exerciseId: string;
  period: AnalyticsPeriod;
  bestOneRm: number | null;
  bestSet: {
    sessionId: string;
    date: Date;
    weightKg: number;
    reps: number;
    rir: number;
  } | null;
  bestVolumeSession: {
    sessionId: string;
    date: Date;
    tonnage: number;
  } | null;
};

export type CorrelationResult = {
  type: CorrelationType;
  points: Array<{ x: number; y: number; date: Date }>;
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;

@Injectable()
export class AnalyticsService {
  private readonly heatmapCache = new Map<
    string,
    { expiresAt: number; value: HeatmapItem[] }
  >();

  constructor(
    private readonly volumeTrackerService: VolumeTrackerService,
    @Inject(ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  async getMuscleHeatmap(userId: string): Promise<HeatmapItem[]> {
    const cacheKey = `heatmap:${userId}`;
    const cached = this.heatmapCache.get(cacheKey);
    const now = Date.now();

    if (cached !== undefined && cached.expiresAt > now) {
      return cached.value;
    }

    const { start, end } = this.getCurrentWeekRange();
    const rows = await this.analyticsRepository.getMuscleHeatmapSnapshot(
      userId,
      start,
      end,
    );

    const rowByMuscle = new Map<MuscleGroup, MuscleHeatmapSnapshot>();
    for (const row of rows) {
      rowByMuscle.set(row.muscleGroup, row);
    }

    const result = Object.values(MuscleGroup).map((muscleGroup) => {
      const row = rowByMuscle.get(muscleGroup);
      const lastTrainedAt = row?.lastTrainedAt ?? null;
      const effectiveSetsThisWeek = row?.effectiveSetsThisWeek ?? 0;

      return {
        muscleGroup,
        lastTrainedAt,
        effectiveSetsThisWeek,
        recovery: this.resolveRecovery(lastTrainedAt),
      } satisfies HeatmapItem;
    });

    this.heatmapCache.set(cacheKey, {
      expiresAt: now + FIVE_MINUTES_MS,
      value: result,
    });

    return result;
  }

  async getStrengthTrend(
    userId: string,
    exerciseId: string,
    period: AnalyticsPeriod,
  ): Promise<StrengthTrendPoint[]> {
    const { start, end } = this.resolvePeriod(period);
    return this.analyticsRepository.getStrengthTrend(
      userId,
      exerciseId,
      start,
      end,
    );
  }

  async getTonnageTrend(
    userId: string,
    exerciseId: string,
    period: AnalyticsPeriod,
  ): Promise<TonnageTrendPoint[]> {
    const { start, end } = this.resolvePeriod(period);
    return this.analyticsRepository.getTonnageTrend(
      userId,
      exerciseId,
      start,
      end,
    );
  }

  async getPersonalRecords(
    userId: string,
    exerciseId: string,
    period: AnalyticsPeriod,
  ): Promise<PersonalRecordsResult> {
    const { start, end } = this.resolvePeriod(period);
    const [bestOneRm, bestSet, bestVolumeSession] = await Promise.all([
      this.analyticsRepository.getBestOneRm(userId, exerciseId, start, end),
      this.analyticsRepository.getBestSet(userId, exerciseId, start, end),
      this.analyticsRepository.getBestSessionVolume(
        userId,
        exerciseId,
        start,
        end,
      ),
    ]);

    return {
      exerciseId,
      period,
      bestOneRm,
      bestSet,
      bestVolumeSession,
    };
  }

  async getCorrelations(
    userId: string,
    type: CorrelationType,
    period: AnalyticsPeriod,
    exerciseId?: string,
  ): Promise<CorrelationResult> {
    const { start, end } = this.resolvePeriod(period);

    if (type === 'BODY_WEIGHT_VS_1RM') {
      if (exerciseId === undefined || exerciseId.trim().length === 0) {
        return {
          type,
          points: [],
        };
      }

      return {
        type,
        points: await this.analyticsRepository.getBodyWeightVsOneRmPoints(
          userId,
          exerciseId,
          start,
          end,
        ),
      };
    }

    return {
      type,
      points: await this.analyticsRepository.getWeeklyVolumeVsReadinessPoints(
        userId,
        start,
        end,
      ),
    };
  }

  async checkDeload(userId: string): Promise<DeloadCheckResult> {
    const [volumeHistory, readinessAverageLast14Days, performanceHistory] =
      await Promise.all([
        this.volumeTrackerService.getVolumeHistory(userId, 3),
        this.getReadinessAverageLast14Days(userId),
        this.getPerformanceHistoryLast3Weeks(userId),
      ]);

    const reasons = new Set<string>();
    const affectedMuscles = new Set<MuscleGroup>();

    for (const muscleGroup of Object.values(MuscleGroup)) {
      const volumeEntries = volumeHistory.map(
        (week) =>
          week.items.find((item) => item.muscleGroup === muscleGroup) ?? null,
      );
      const weeksOverMrv = volumeEntries.filter(
        (entry) => entry !== null && entry.status === 'ABOVE_MRV',
      ).length;

      const trend = this.getProgressionTrend(performanceHistory, muscleGroup);

      if (weeksOverMrv >= 2) {
        reasons.add('Volumen por encima del MRV por 2+ semanas');
        affectedMuscles.add(muscleGroup);
      }

      if (trend === 'WORSENING') {
        reasons.add('Rendimiento en regresión (estimated 1RM en descenso)');
        affectedMuscles.add(muscleGroup);
      }

      if (trend === 'STALLED' && weeksOverMrv >= 1) {
        reasons.add('Estancamiento con volumen elevado');
        affectedMuscles.add(muscleGroup);
      }
    }

    if (readinessAverageLast14Days !== null && readinessAverageLast14Days < 2) {
      reasons.add('Readiness score bajo sostenido');
    }

    return {
      needsDeload: reasons.size > 0,
      reasons: Array.from(reasons),
      affectedMuscles: Array.from(affectedMuscles),
      readinessAverageLast14Days,
    };
  }

  private async getReadinessAverageLast14Days(
    userId: string,
  ): Promise<number | null> {
    const end = new Date();
    const start = new Date(end.getTime() - 14 * 24 * 60 * 60 * 1000);
    return this.analyticsRepository.getAverageReadiness(userId, start, end);
  }

  private async getPerformanceHistoryLast3Weeks(
    userId: string,
  ): Promise<MuscleOneRmWeeklyPoint[]> {
    const end = new Date();
    const start = new Date(end.getTime() - 21 * 24 * 60 * 60 * 1000);

    return this.analyticsRepository.getWeeklyEstimatedOneRmByMuscleGroup(
      userId,
      start,
      end,
    );
  }

  private getCurrentWeekRange(): { start: Date; end: Date } {
    const now = new Date();
    const daySinceMonday = (now.getUTCDay() + 6) % 7;
    const start = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate() - daySinceMonday,
      ),
    );

    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { start, end };
  }

  private resolveRecovery(lastTrainedAt: Date | null): HeatmapRecovery {
    if (lastTrainedAt === null) {
      return 'STALE';
    }

    const hoursSince =
      (Date.now() - lastTrainedAt.getTime()) / (1000 * 60 * 60);

    if (hoursSince < 24) {
      return 'FATIGUED';
    }

    if (hoursSince <= 72) {
      return 'RECENT';
    }

    return 'FRESH';
  }

  private resolvePeriod(period: AnalyticsPeriod): { start: Date; end: Date } {
    const end = new Date();

    if (period === 'all') {
      return {
        start: new Date('1970-01-01T00:00:00.000Z'),
        end,
      };
    }

    const dayMap: Record<Exclude<AnalyticsPeriod, 'all'>, number> = {
      '30d': 30,
      '90d': 90,
      '180d': 180,
      '1y': 365,
    };

    const days = dayMap[period];
    return {
      start: new Date(end.getTime() - days * 24 * 60 * 60 * 1000),
      end,
    };
  }

  private getProgressionTrend(
    points: MuscleOneRmWeeklyPoint[],
    muscleGroup: MuscleGroup,
  ): 'IMPROVING' | 'STALLED' | 'WORSENING' {
    const musclePoints = points
      .filter((point) => point.muscleGroup === muscleGroup)
      .sort(
        (left, right) => left.weekStart.getTime() - right.weekStart.getTime(),
      );

    if (musclePoints.length < 2) {
      return 'STALLED';
    }

    const last = musclePoints[musclePoints.length - 1]?.avgEstimatedOneRm ?? 0;
    const previousPoints = musclePoints
      .slice(0, -1)
      .map((point) => point.avgEstimatedOneRm);

    if (previousPoints.length === 0) {
      return 'STALLED';
    }

    const previousAverage =
      previousPoints.reduce((sum, value) => sum + value, 0) /
      previousPoints.length;

    if (previousAverage <= 0) {
      return 'STALLED';
    }

    const ratio = last / previousAverage;

    if (ratio < 0.98) {
      return 'WORSENING';
    }

    if (ratio <= 1.02) {
      return 'STALLED';
    }

    return 'IMPROVING';
  }
}
