import { Inject, Injectable } from '@nestjs/common';
import {
  ANALYTICS_REPOSITORY,
  VolumeLandmark,
} from '../interfaces/analytics-repository.interface';
import type { IAnalyticsRepository } from '../interfaces/analytics-repository.interface';
import { MuscleGroup } from '../../domain/enums';

export type VolumeStatus = 'BELOW_MEV' | 'WITHIN_RANGE' | 'ABOVE_MRV';

export type WeeklyVolumeItem = {
  muscleGroup: MuscleGroup;
  effectiveSets: number;
  mev: number;
  mrv: number;
  status: VolumeStatus;
};

export type WeeklyVolumeResult = {
  weekOffset: number;
  weekStart: Date;
  weekEnd: Date;
  items: WeeklyVolumeItem[];
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;

const DEFAULT_VOLUME_LANDMARKS: Record<
  MuscleGroup,
  { mev: number; mrv: number }
> = {
  [MuscleGroup.CHEST]: { mev: 8, mrv: 22 },
  [MuscleGroup.BACK]: { mev: 8, mrv: 25 },
  [MuscleGroup.SHOULDERS]: { mev: 6, mrv: 26 },
  [MuscleGroup.BICEPS]: { mev: 4, mrv: 20 },
  [MuscleGroup.TRICEPS]: { mev: 4, mrv: 18 },
  [MuscleGroup.FOREARMS]: { mev: 0, mrv: 12 },
  [MuscleGroup.QUADRICEPS]: { mev: 6, mrv: 20 },
  [MuscleGroup.HAMSTRINGS]: { mev: 4, mrv: 20 },
  [MuscleGroup.GLUTES]: { mev: 0, mrv: 16 },
  [MuscleGroup.CALVES]: { mev: 6, mrv: 20 },
  [MuscleGroup.CORE]: { mev: 0, mrv: 16 },
  [MuscleGroup.TRAPS]: { mev: 0, mrv: 14 },
};

@Injectable()
export class VolumeTrackerService {
  private readonly weeklyVolumeCache = new Map<
    string,
    { expiresAt: number; value: WeeklyVolumeResult }
  >();

  constructor(
    @Inject(ANALYTICS_REPOSITORY)
    private readonly analyticsRepository: IAnalyticsRepository,
  ) {}

  async getWeeklyVolume(
    userId: string,
    weekOffset = 0,
  ): Promise<WeeklyVolumeResult> {
    const cacheKey = `${userId}:${weekOffset}`;
    const now = Date.now();
    const cached = this.weeklyVolumeCache.get(cacheKey);
    if (cached !== undefined && cached.expiresAt > now) {
      return cached.value;
    }

    const { start, end } = this.getWeekRange(weekOffset);
    const [volumeRows, customLandmarks] = await Promise.all([
      this.analyticsRepository.getEffectiveVolumeByMuscleGroup(
        userId,
        start,
        end,
      ),
      this.analyticsRepository.getUserVolumeLandmarks(userId),
    ]);

    const landmarksByMuscle = this.buildLandmarksMap(customLandmarks);
    const effectiveSetsByMuscle = new Map<MuscleGroup, number>();
    for (const row of volumeRows) {
      effectiveSetsByMuscle.set(row.muscleGroup, row.effectiveSets);
    }

    const items = Object.values(MuscleGroup).map((muscleGroup) => {
      const landmarks =
        landmarksByMuscle.get(muscleGroup) ??
        DEFAULT_VOLUME_LANDMARKS[muscleGroup];
      const effectiveSets = effectiveSetsByMuscle.get(muscleGroup) ?? 0;

      return {
        muscleGroup,
        effectiveSets,
        mev: landmarks.mev,
        mrv: landmarks.mrv,
        status: this.resolveStatus(effectiveSets, landmarks.mev, landmarks.mrv),
      } satisfies WeeklyVolumeItem;
    });

    const result: WeeklyVolumeResult = {
      weekOffset,
      weekStart: start,
      weekEnd: end,
      items,
    };

    this.weeklyVolumeCache.set(cacheKey, {
      expiresAt: now + FIVE_MINUTES_MS,
      value: result,
    });

    return result;
  }

  async getVolumeHistory(
    userId: string,
    weeks: number,
  ): Promise<WeeklyVolumeResult[]> {
    const history: WeeklyVolumeResult[] = [];

    for (let weekOffset = weeks - 1; weekOffset >= 0; weekOffset -= 1) {
      history.push(await this.getWeeklyVolume(userId, weekOffset));
    }

    return history;
  }

  private buildLandmarksMap(
    customLandmarks: VolumeLandmark[],
  ): Map<MuscleGroup, { mev: number; mrv: number }> {
    const map = new Map<MuscleGroup, { mev: number; mrv: number }>();

    for (const landmark of customLandmarks) {
      map.set(landmark.muscleGroup, {
        mev: landmark.mev,
        mrv: landmark.mrv,
      });
    }

    return map;
  }

  private resolveStatus(
    effectiveSets: number,
    mev: number,
    mrv: number,
  ): VolumeStatus {
    if (effectiveSets < mev) {
      return 'BELOW_MEV';
    }

    if (effectiveSets > mrv) {
      return 'ABOVE_MRV';
    }

    return 'WITHIN_RANGE';
  }

  private getWeekRange(weekOffset: number): { start: Date; end: Date } {
    const now = new Date();
    const daySinceMonday = (now.getUTCDay() + 6) % 7;
    const currentWeekStartUtc = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daySinceMonday,
    );

    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const start = new Date(currentWeekStartUtc - weekOffset * oneWeekMs);
    const end = new Date(start.getTime() + oneWeekMs);

    return { start, end };
  }
}
