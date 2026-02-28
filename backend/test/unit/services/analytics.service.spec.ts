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
});
