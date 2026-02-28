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
}
