import { AutoregulationService } from '../../../src/application/services/autoregulation.service';
import type {
  ISessionHistoryRepository,
  LastSessionPerformance,
} from '../../../src/application/interfaces/session-history-repository.interface';
import { EquipmentType, MovementPattern } from '../../../src/domain/enums';

describe('AutoregulationService', () => {
  let sessionHistoryRepository: jest.Mocked<ISessionHistoryRepository>;
  let service: AutoregulationService;

  const buildLastSessionData = (
    overrides: Partial<LastSessionPerformance> = {},
  ): LastSessionPerformance => ({
    weightKg: 100,
    reps: 10,
    rir: 2,
    rirObjective: 2,
    repsObjectiveMin: 8,
    movementPattern: MovementPattern.SQUAT,
    equipmentType: EquipmentType.BARBELL,
    ...overrides,
  });

  beforeEach(() => {
    sessionHistoryRepository = {
      findLastPerformance: jest.fn(),
    };

    service = new AutoregulationService(sessionHistoryRepository);
  });

  it('returns null when there is no historical data', async () => {
    sessionHistoryRepository.findLastPerformance.mockResolvedValue(null);

    await expect(
      service.suggestWeight('user-1', 'exercise-1'),
    ).resolves.toBeNull();
  });

  it('keeps weight when deltaRIR is greater than zero', async () => {
    sessionHistoryRepository.findLastPerformance.mockResolvedValue(
      buildLastSessionData({ rir: 3, rirObjective: 2 }),
    );

    await expect(service.suggestWeight('user-1', 'exercise-1')).resolves.toBe(
      100,
    );
  });

  it('increases weight when deltaRIR equals zero', async () => {
    sessionHistoryRepository.findLastPerformance.mockResolvedValue(
      buildLastSessionData({ rir: 2, rirObjective: 2 }),
    );

    await expect(service.suggestWeight('user-1', 'exercise-1')).resolves.toBe(
      102.5,
    );
  });

  it('reduces weight by 5% when failed below minimum reps', async () => {
    sessionHistoryRepository.findLastPerformance.mockResolvedValue(
      buildLastSessionData({
        rir: 0,
        rirObjective: 2,
        reps: 6,
        repsObjectiveMin: 8,
      }),
    );

    await expect(service.suggestWeight('user-1', 'exercise-1')).resolves.toBe(
      95,
    );
  });

  it('applies readiness reduction when readinessScore is low', async () => {
    sessionHistoryRepository.findLastPerformance.mockResolvedValue(
      buildLastSessionData({ rir: 2, rirObjective: 2 }),
    );

    await expect(
      service.suggestWeight('user-1', 'exercise-1', 2.4),
    ).resolves.toBe(97.5);
  });

  it('uses 1.25kg increment for isolation or machine-like exercises', async () => {
    sessionHistoryRepository.findLastPerformance.mockResolvedValue(
      buildLastSessionData({
        movementPattern: MovementPattern.ISOLATION,
        equipmentType: EquipmentType.MACHINE,
      }),
    );

    await expect(service.suggestWeight('user-1', 'exercise-1')).resolves.toBe(
      101.25,
    );
  });
});
