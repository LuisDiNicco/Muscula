import { AchievementService } from '../../../src/application/services/achievement.service';
import type {
  AchievementWithStatus,
  IAchievementRepository,
} from '../../../src/application/interfaces/achievement-repository.interface';

describe('AchievementService', () => {
  let achievementRepository: jest.Mocked<IAchievementRepository>;
  let service: AchievementService;

  const baseAchievements = (): AchievementWithStatus[] => [
    {
      id: 'a-1',
      code: 'FIRST_SESSION',
      titleEs: 'Primera sesión',
      titleEn: 'First session',
      descriptionEs: 'd',
      descriptionEn: 'd',
      iconUrl: 'icon',
      condition: '1 sesión',
      unlockedAt: null,
    },
    {
      id: 'a-2',
      code: 'SESSIONS_25',
      titleEs: '25 sesiones',
      titleEn: '25 sessions',
      descriptionEs: 'd',
      descriptionEn: 'd',
      iconUrl: 'icon',
      condition: '25 sesiones',
      unlockedAt: null,
    },
    {
      id: 'a-3',
      code: 'STREAK_7',
      titleEs: 'Racha 7',
      titleEn: 'Streak 7',
      descriptionEs: 'd',
      descriptionEn: 'd',
      iconUrl: 'icon',
      condition: '7 días',
      unlockedAt: null,
    },
    {
      id: 'a-4',
      code: 'NUTRITION_STREAK_7',
      titleEs: 'Nutri 7',
      titleEn: 'Nutri 7',
      descriptionEs: 'd',
      descriptionEn: 'd',
      iconUrl: 'icon',
      condition: '7 días',
      unlockedAt: null,
    },
    {
      id: 'a-5',
      code: 'WEIGHT_LOGGER_30',
      titleEs: 'Peso 30',
      titleEn: 'Weight 30',
      descriptionEs: 'd',
      descriptionEn: 'd',
      iconUrl: 'icon',
      condition: '30 días',
      unlockedAt: null,
    },
    {
      id: 'a-6',
      code: 'FIRST_PROGRESS_PHOTO',
      titleEs: 'Foto 1',
      titleEn: 'Photo 1',
      descriptionEs: 'd',
      descriptionEn: 'd',
      iconUrl: 'icon',
      condition: '1 foto',
      unlockedAt: null,
    },
    {
      id: 'a-7',
      code: 'MESOCYCLE_COMPLETE',
      titleEs: 'Meso',
      titleEn: 'Meso',
      descriptionEs: 'd',
      descriptionEn: 'd',
      iconUrl: 'icon',
      condition: '1 meso',
      unlockedAt: null,
    },
    {
      id: 'a-8',
      code: 'FIRST_PR',
      titleEs: 'PR',
      titleEn: 'PR',
      descriptionEs: 'd',
      descriptionEn: 'd',
      iconUrl: 'icon',
      condition: '1 PR',
      unlockedAt: null,
    },
  ];

  beforeEach(() => {
    achievementRepository = {
      getAchievementsWithStatus: jest.fn(),
      getUserStats: jest.fn(),
      unlockByCodes: jest.fn(),
    };

    service = new AchievementService(achievementRepository);
  });

  it('unlocks session achievements on session completed event', async () => {
    achievementRepository.getAchievementsWithStatus.mockResolvedValue(
      baseAchievements(),
    );
    achievementRepository.getUserStats.mockResolvedValue({
      completedSessions: 25,
      completedSessionDates: [
        new Date('2026-02-01T00:00:00.000Z'),
        new Date('2026-02-02T00:00:00.000Z'),
        new Date('2026-02-03T00:00:00.000Z'),
        new Date('2026-02-04T00:00:00.000Z'),
        new Date('2026-02-05T00:00:00.000Z'),
        new Date('2026-02-06T00:00:00.000Z'),
        new Date('2026-02-07T00:00:00.000Z'),
      ],
      nutritionLogDates: [],
      weightLogDates: [],
      hasProgressPhoto: false,
    });

    const unlocked = await service.evaluateAchievements(
      'user-1',
      'SESSION_COMPLETED',
    );

    expect(unlocked).toEqual(
      expect.arrayContaining(['FIRST_SESSION', 'SESSIONS_25', 'STREAK_7']),
    );
    expect(
      achievementRepository.unlockByCodes.mock.calls.length,
    ).toBeGreaterThan(0);
  });

  it('unlocks nutrition and weight streak achievements by corresponding events', async () => {
    achievementRepository.getAchievementsWithStatus.mockResolvedValue(
      baseAchievements(),
    );
    achievementRepository.getUserStats.mockResolvedValue({
      completedSessions: 0,
      completedSessionDates: [],
      nutritionLogDates: [
        new Date('2026-02-01T00:00:00.000Z'),
        new Date('2026-02-02T00:00:00.000Z'),
        new Date('2026-02-03T00:00:00.000Z'),
        new Date('2026-02-04T00:00:00.000Z'),
        new Date('2026-02-05T00:00:00.000Z'),
        new Date('2026-02-06T00:00:00.000Z'),
        new Date('2026-02-07T00:00:00.000Z'),
      ],
      weightLogDates: Array.from({ length: 30 }).map(
        (_, index) => new Date(Date.UTC(2026, 0, index + 1)),
      ),
      hasProgressPhoto: false,
    });

    const nutritionUnlocked = await service.evaluateAchievements(
      'user-1',
      'NUTRITION_LOGGED',
    );
    const weightUnlocked = await service.evaluateAchievements(
      'user-1',
      'WEIGHT_LOGGED',
    );

    expect(nutritionUnlocked).toContain('NUTRITION_STREAK_7');
    expect(weightUnlocked).toContain('WEIGHT_LOGGER_30');
  });

  it('unlocks progress photo and mesocycle achievements on event triggers', async () => {
    achievementRepository.getAchievementsWithStatus.mockResolvedValue(
      baseAchievements(),
    );
    achievementRepository.getUserStats.mockResolvedValue({
      completedSessions: 0,
      completedSessionDates: [],
      nutritionLogDates: [],
      weightLogDates: [],
      hasProgressPhoto: true,
    });

    const photoUnlocked = await service.evaluateAchievements(
      'user-1',
      'PROGRESS_PHOTO_UPLOADED',
    );
    const mesocycleUnlocked = await service.evaluateAchievements(
      'user-1',
      'MESOCYCLE_COMPLETED',
    );

    expect(photoUnlocked).toContain('FIRST_PROGRESS_PHOTO');
    expect(mesocycleUnlocked).toContain('MESOCYCLE_COMPLETE');
  });

  it('does not unlock FIRST_PR unless PR_ACHIEVED event arrives', async () => {
    achievementRepository.getAchievementsWithStatus.mockResolvedValue(
      baseAchievements(),
    );
    achievementRepository.getUserStats.mockResolvedValue({
      completedSessions: 100,
      completedSessionDates: [],
      nutritionLogDates: [],
      weightLogDates: [],
      hasProgressPhoto: false,
    });

    const withoutPr = await service.evaluateAchievements(
      'user-1',
      'SESSION_COMPLETED',
    );
    const withPr = await service.evaluateAchievements('user-1', 'PR_ACHIEVED');

    expect(withoutPr).not.toContain('FIRST_PR');
    expect(withPr).toContain('FIRST_PR');
  });
});
