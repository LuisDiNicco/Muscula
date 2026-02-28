import { IBodyMetricRepository } from '../../../src/application/interfaces/body-metric-repository.interface';
import { INutritionRepository } from '../../../src/application/interfaces/nutrition-repository.interface';
import { IUserRepository } from '../../../src/application/interfaces/user-repository.interface';
import { TdeeCalculatorService } from '../../../src/application/services/tdee-calculator.service';
import { UserEntity } from '../../../src/domain/entities/user.entity';
import {
  ActivityLevel,
  ExperienceLevel,
  Gender,
} from '../../../src/domain/enums';

describe('TdeeCalculatorService', () => {
  const buildUser = (): UserEntity =>
    new UserEntity({
      id: 'user-1',
      email: 'user@test.com',
      username: 'user1',
      passwordHash: 'hashed',
      emailVerified: true,
      avatarUrl: null,
      dateOfBirth: new Date('1996-01-10T00:00:00.000Z'),
      gender: Gender.MALE,
      heightCm: 178,
      currentWeightKg: 80,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE,
      experience: ExperienceLevel.INTERMEDIATE,
      deletedAt: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

  let userRepository: jest.Mocked<IUserRepository>;
  let nutritionRepository: jest.Mocked<INutritionRepository>;
  let bodyMetricRepository: jest.Mocked<IBodyMetricRepository>;
  let service: TdeeCalculatorService;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      getPreferences: jest.fn(),
      updatePreferences: jest.fn(),
    };

    nutritionRepository = {
      getDailyMeals: jest.fn(),
      ensureMeal: jest.fn(),
      addFoodEntry: jest.fn(),
      deleteFoodEntry: jest.fn(),
      searchFoods: jest.fn(),
      searchFoodByBarcode: jest.fn(),
      createCustomFood: jest.fn(),
      getDailyCalories: jest.fn(),
      cacheApiFoods: jest.fn(),
      getBodyMode: jest.fn(),
      setBodyMode: jest.fn(),
    };

    bodyMetricRepository = {
      record: jest.fn(),
      list: jest.fn(),
      getRecentWeights: jest.fn(),
    };

    service = new TdeeCalculatorService(
      userRepository,
      nutritionRepository,
      bodyMetricRepository,
    );
  });

  it('calculates static TDEE using Mifflin-St Jeor and activity factor', () => {
    const tdee = service.getStaticTdee(buildUser());
    expect(tdee).toBeGreaterThan(2500);
    expect(tdee).toBeLessThan(2900);
  });

  it('returns static estimate when fewer than 14 days of data are available', async () => {
    userRepository.findById.mockResolvedValue(buildUser());
    nutritionRepository.getDailyCalories.mockResolvedValue([
      { date: new Date('2026-02-20T00:00:00.000Z'), calories: 2500 },
    ]);
    bodyMetricRepository.getRecentWeights.mockResolvedValue([
      { date: new Date('2026-02-20T00:00:00.000Z'), weightKg: 80 },
    ]);

    const result = await service.calculateTdee('user-1');

    expect(result.confidence).toBe('estimado');
    expect(result.tdee).toBeGreaterThan(2400);
  });

  it('returns dynamic TDEE when enough calories and weight data exist', async () => {
    userRepository.findById.mockResolvedValue(buildUser());

    const dailyCalories = Array.from({ length: 28 }, (_, index) => ({
      date: new Date(
        `2026-02-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
      ),
      calories: 2600,
    }));

    const weights = Array.from({ length: 28 }, (_, index) => ({
      date: new Date(
        `2026-02-${String(index + 1).padStart(2, '0')}T00:00:00.000Z`,
      ),
      weightKg: 80 + index * 0.01,
    }));

    nutritionRepository.getDailyCalories.mockResolvedValue(dailyCalories);
    bodyMetricRepository.getRecentWeights.mockResolvedValue(weights);

    const result = await service.calculateTdee('user-1');

    expect(result.confidence).toBe('preciso');
    expect(result.tdee).toBeGreaterThan(2200);
    expect(result.tdee).toBeLessThan(3000);
  });
});
