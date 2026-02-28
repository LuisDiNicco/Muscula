import type { IAnalyticsRepository } from '../../../src/application/interfaces/analytics-repository.interface';
import { AnalyticsService } from '../../../src/application/services/analytics.service';
import type { WeeklyVolumeResult } from '../../../src/application/services/volume-tracker.service';
import { VolumeTrackerService } from '../../../src/application/services/volume-tracker.service';
import { MuscleGroup } from '../../../src/domain/enums';

describe('AnalyticsService', () => {
  let volumeTrackerService: jest.Mocked<VolumeTrackerService>;
  let analyticsRepository: jest.Mocked<IAnalyticsRepository>;
  let service: AnalyticsService;

  beforeEach(() => {
    volumeTrackerService = {
      getWeeklyVolume: jest.fn(),
      getVolumeHistory: jest.fn(),
    } as unknown as jest.Mocked<VolumeTrackerService>;

    analyticsRepository = {
      getEffectiveVolumeByMuscleGroup: jest.fn(),
      getUserVolumeLandmarks: jest.fn(),
      getAverageReadiness: jest.fn(),
      getWeeklyEstimatedOneRmByMuscleGroup: jest.fn(),
      getMuscleHeatmapSnapshot: jest.fn(),
      getStrengthTrend: jest.fn(),
      getTonnageTrend: jest.fn(),
      getBestOneRm: jest.fn(),
      getBestSet: jest.fn(),
      getBestSessionVolume: jest.fn(),
      getBodyWeightVsOneRmPoints: jest.fn(),
      getWeeklyVolumeVsReadinessPoints: jest.fn(),
    };

    service = new AnalyticsService(volumeTrackerService, analyticsRepository);
  });

  it('recommends deload when volume is above MRV for 2+ weeks', async () => {
    const week = (
      status: 'ABOVE_MRV' | 'WITHIN_RANGE',
    ): WeeklyVolumeResult => ({
      weekOffset: 0,
      weekStart: new Date('2026-02-02T00:00:00.000Z'),
      weekEnd: new Date('2026-02-09T00:00:00.000Z'),
      items: [
        {
          muscleGroup: MuscleGroup.CHEST,
          effectiveSets: status === 'ABOVE_MRV' ? 25 : 12,
          mev: 8,
          mrv: 22,
          status,
        },
      ],
    });

    volumeTrackerService.getVolumeHistory.mockResolvedValue([
      week('ABOVE_MRV'),
      week('ABOVE_MRV'),
      week('WITHIN_RANGE'),
    ]);
    analyticsRepository.getAverageReadiness.mockResolvedValue(2.8);
    analyticsRepository.getWeeklyEstimatedOneRmByMuscleGroup.mockResolvedValue(
      [],
    );

    const result = await service.checkDeload('user-1');

    expect(result.needsDeload).toBe(true);
    expect(result.reasons).toContain(
      'Volumen por encima del MRV por 2+ semanas',
    );
    expect(result.affectedMuscles).toContain(MuscleGroup.CHEST);
  });

  it('recommends deload when readiness is low', async () => {
    volumeTrackerService.getVolumeHistory.mockResolvedValue([]);
    analyticsRepository.getAverageReadiness.mockResolvedValue(1.8);
    analyticsRepository.getWeeklyEstimatedOneRmByMuscleGroup.mockResolvedValue(
      [],
    );

    const result = await service.checkDeload('user-1');

    expect(result.needsDeload).toBe(true);
    expect(result.reasons).toContain('Readiness score bajo sostenido');
  });

  it('returns cached heatmap within TTL window', async () => {
    analyticsRepository.getMuscleHeatmapSnapshot.mockResolvedValue([
      {
        muscleGroup: MuscleGroup.CHEST,
        lastTrainedAt: new Date('2026-02-28T10:00:00.000Z'),
        effectiveSetsThisWeek: 8,
      },
    ]);

    await service.getMuscleHeatmap('user-1');
    await service.getMuscleHeatmap('user-1');

    expect(
      analyticsRepository.getMuscleHeatmapSnapshot.mock.calls,
    ).toHaveLength(1);
  });

  it('returns strength and tonnage trends using selected period', async () => {
    analyticsRepository.getStrengthTrend.mockResolvedValue([
      { date: new Date('2026-02-20T00:00:00.000Z'), estimatedOneRm: 130 },
    ]);
    analyticsRepository.getTonnageTrend.mockResolvedValue([
      { date: new Date('2026-02-20T00:00:00.000Z'), tonnage: 3200 },
    ]);

    const strength = await service.getStrengthTrend(
      'user-1',
      'exercise-1',
      '90d',
    );
    const tonnage = await service.getTonnageTrend(
      'user-1',
      'exercise-1',
      '90d',
    );

    expect(strength[0]?.estimatedOneRm).toBe(130);
    expect(tonnage[0]?.tonnage).toBe(3200);
    expect(analyticsRepository.getStrengthTrend.mock.calls).toHaveLength(1);
    expect(analyticsRepository.getTonnageTrend.mock.calls).toHaveLength(1);
  });

  it('aggregates personal records from repository', async () => {
    analyticsRepository.getBestOneRm.mockResolvedValue(142.5);
    analyticsRepository.getBestSet.mockResolvedValue({
      sessionId: 'session-1',
      date: new Date('2026-02-20T00:00:00.000Z'),
      weightKg: 120,
      reps: 8,
      rir: 1,
    });
    analyticsRepository.getBestSessionVolume.mockResolvedValue({
      sessionId: 'session-2',
      date: new Date('2026-02-21T00:00:00.000Z'),
      tonnage: 5200,
    });

    const result = await service.getPersonalRecords(
      'user-1',
      'exercise-1',
      'all',
    );

    expect(result.bestOneRm).toBe(142.5);
    expect(result.bestSet?.reps).toBe(8);
    expect(result.bestVolumeSession?.tonnage).toBe(5200);
  });

  it('returns empty correlation when exerciseId is missing for BODY_WEIGHT_VS_1RM', async () => {
    const result = await service.getCorrelations(
      'user-1',
      'BODY_WEIGHT_VS_1RM',
      '30d',
    );

    expect(result.points).toHaveLength(0);
    expect(
      analyticsRepository.getBodyWeightVsOneRmPoints.mock.calls,
    ).toHaveLength(0);
  });
});
