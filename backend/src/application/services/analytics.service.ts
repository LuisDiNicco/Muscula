import { Inject, Injectable } from '@nestjs/common';
import {
  ANALYTICS_REPOSITORY,
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

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly volumeTrackerService: VolumeTrackerService,
    @Inject(ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: IAnalyticsRepository,
  ) {}

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
