import {
  IAnalyticsRepository,
  MuscleVolumeSnapshot,
  VolumeLandmark,
} from '../../../src/application/interfaces/analytics-repository.interface';
import { VolumeTrackerService } from '../../../src/application/services/volume-tracker.service';
import { MuscleGroup } from '../../../src/domain/enums';

describe('VolumeTrackerService', () => {
  let analyticsRepository: jest.Mocked<IAnalyticsRepository>;
  let service: VolumeTrackerService;

  beforeEach(() => {
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

    service = new VolumeTrackerService(analyticsRepository);
  });

  it('builds weekly volume using effective sets and custom landmarks', async () => {
    const snapshots: MuscleVolumeSnapshot[] = [
      { muscleGroup: MuscleGroup.CHEST, effectiveSets: 9 },
      { muscleGroup: MuscleGroup.BACK, effectiveSets: 26 },
    ];
    const landmarks: VolumeLandmark[] = [
      { muscleGroup: MuscleGroup.CHEST, mev: 10, mrv: 20 },
    ];

    analyticsRepository.getEffectiveVolumeByMuscleGroup.mockResolvedValue(
      snapshots,
    );
    analyticsRepository.getUserVolumeLandmarks.mockResolvedValue(landmarks);

    const result = await service.getWeeklyVolume('user-1', 0);

    const chest = result.items.find(
      (item) => item.muscleGroup === MuscleGroup.CHEST,
    );
    const back = result.items.find(
      (item) => item.muscleGroup === MuscleGroup.BACK,
    );

    expect(chest).toEqual(
      expect.objectContaining({
        effectiveSets: 9,
        mev: 10,
        mrv: 20,
        status: 'BELOW_MEV',
      }),
    );

    expect(back).toEqual(
      expect.objectContaining({
        effectiveSets: 26,
        status: 'ABOVE_MRV',
      }),
    );
  });

  it('returns cached weekly volume inside TTL window', async () => {
    analyticsRepository.getEffectiveVolumeByMuscleGroup.mockResolvedValue([]);
    analyticsRepository.getUserVolumeLandmarks.mockResolvedValue([]);

    await service.getWeeklyVolume('user-1', 0);
    await service.getWeeklyVolume('user-1', 0);

    expect(
      analyticsRepository.getEffectiveVolumeByMuscleGroup.mock.calls,
    ).toHaveLength(1);
    expect(analyticsRepository.getUserVolumeLandmarks.mock.calls).toHaveLength(
      1,
    );
  });
});
