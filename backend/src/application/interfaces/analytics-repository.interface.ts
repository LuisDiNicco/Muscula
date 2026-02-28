import { MuscleGroup } from '../../domain/enums';

export const ANALYTICS_REPOSITORY = 'ANALYTICS_REPOSITORY';

export type MuscleVolumeSnapshot = {
  muscleGroup: MuscleGroup;
  effectiveSets: number;
};

export type VolumeLandmark = {
  muscleGroup: MuscleGroup;
  mev: number;
  mrv: number;
};

export type MuscleOneRmWeeklyPoint = {
  weekStart: Date;
  muscleGroup: MuscleGroup;
  avgEstimatedOneRm: number;
};

export type MuscleHeatmapSnapshot = {
  muscleGroup: MuscleGroup;
  lastTrainedAt: Date | null;
  effectiveSetsThisWeek: number;
};

export type OneRmPoint = {
  date: Date;
  estimatedOneRm: number;
};

export type TonnagePoint = {
  date: Date;
  tonnage: number;
};

export type SessionVolumePoint = {
  sessionId: string;
  date: Date;
  tonnage: number;
};

export type BestSetRecord = {
  sessionId: string;
  date: Date;
  weightKg: number;
  reps: number;
  rir: number;
};

export type CorrelationPoint = {
  x: number;
  y: number;
  date: Date;
};

export type CorrelationType =
  | 'BODY_WEIGHT_VS_1RM'
  | 'WEEKLY_VOLUME_VS_READINESS';

export type AnalyticsPeriod = '30d' | '90d' | '180d' | '1y' | 'all';

export interface IAnalyticsRepository {
  getEffectiveVolumeByMuscleGroup(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MuscleVolumeSnapshot[]>;
  getUserVolumeLandmarks(userId: string): Promise<VolumeLandmark[]>;
  getAverageReadiness(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number | null>;
  getWeeklyEstimatedOneRmByMuscleGroup(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MuscleOneRmWeeklyPoint[]>;
  getMuscleHeatmapSnapshot(
    userId: string,
    weekStart: Date,
    weekEnd: Date,
  ): Promise<MuscleHeatmapSnapshot[]>;
  getStrengthTrend(
    userId: string,
    exerciseId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<OneRmPoint[]>;
  getTonnageTrend(
    userId: string,
    exerciseId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TonnagePoint[]>;
  getBestOneRm(
    userId: string,
    exerciseId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number | null>;
  getBestSet(
    userId: string,
    exerciseId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<BestSetRecord | null>;
  getBestSessionVolume(
    userId: string,
    exerciseId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<SessionVolumePoint | null>;
  getBodyWeightVsOneRmPoints(
    userId: string,
    exerciseId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CorrelationPoint[]>;
  getWeeklyVolumeVsReadinessPoints(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<CorrelationPoint[]>;
}
