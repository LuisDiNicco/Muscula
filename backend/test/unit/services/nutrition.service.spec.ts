import { IFoodApiClient } from '../../../src/application/interfaces/food-api-client.interface';
import { INutritionRepository } from '../../../src/application/interfaces/nutrition-repository.interface';
import { IUserRepository } from '../../../src/application/interfaces/user-repository.interface';
import { NutritionService } from '../../../src/application/services/nutrition.service';
import { TdeeCalculatorService } from '../../../src/application/services/tdee-calculator.service';
import { FoodEntryEntity } from '../../../src/domain/entities/food-entry.entity';
import { MealEntity } from '../../../src/domain/entities/meal.entity';
import { UserEntity } from '../../../src/domain/entities/user.entity';
import {
  BodyMode,
  ExperienceLevel,
  Gender,
  MealType,
  ActivityLevel,
} from '../../../src/domain/enums';

describe('NutritionService', () => {
  const now = new Date('2026-02-28T00:00:00.000Z');

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
      createdAt: now,
      updatedAt: now,
    });

  let nutritionRepository: jest.Mocked<INutritionRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let foodApiClient: jest.Mocked<IFoodApiClient>;
  let tdeeCalculatorService: jest.Mocked<TdeeCalculatorService>;
  let service: NutritionService;

  beforeEach(() => {
    nutritionRepository = {
      getDailyMeals: jest.fn(),
      ensureMeal: jest.fn(),
      addFoodEntry: jest.fn(),
      deleteFoodEntry: jest.fn(),
      searchFoods: jest.fn(),
      searchFoodByBarcode: jest.fn(),
      createCustomFood: jest.fn(),
      getDailyCalories: jest.fn(),
      getBodyMode: jest.fn().mockResolvedValue(BodyMode.MAINTENANCE),
      setBodyMode: jest.fn().mockResolvedValue(BodyMode.MAINTENANCE),
    };

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

    foodApiClient = {
      search: jest.fn(),
      searchByBarcode: jest.fn(),
    };

    tdeeCalculatorService = {
      calculateTdee: jest.fn(),
      getStaticTdee: jest.fn(),
    } as unknown as jest.Mocked<TdeeCalculatorService>;

    service = new NutritionService(
      nutritionRepository,
      userRepository,
      foodApiClient,
      tdeeCalculatorService,
    );
  });

  it('computes daily totals and macro targets based on body mode', async () => {
    userRepository.findById.mockResolvedValue(buildUser());
    nutritionRepository.setBodyMode.mockResolvedValue(BodyMode.BULK);
    nutritionRepository.getBodyMode.mockResolvedValue(BodyMode.BULK);
    tdeeCalculatorService.calculateTdee.mockResolvedValue({
      tdee: 2600,
      confidence: 'estimado',
    });

    const meal = new MealEntity({
      id: 'meal-1',
      userId: 'user-1',
      date: now,
      mealType: MealType.LUNCH,
      notes: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

    const entry = new FoodEntryEntity({
      id: 'entry-1',
      userId: 'user-1',
      mealId: 'meal-1',
      foodId: 'food-1',
      customFoodName: null,
      grams: 150,
      calories: 300,
      protein: 25,
      carbs: 30,
      fat: 8,
      createdAt: now,
      updatedAt: now,
    });

    nutritionRepository.getDailyMeals.mockResolvedValue([
      { meal, entries: [entry] },
    ]);

    await service.setBodyMode('user-1', BodyMode.BULK);
    const result = await service.getDailyNutrition('user-1', now);

    expect(result.totals.calories).toBe(300);
    expect(result.bodyMode).toBe(BodyMode.BULK);
    expect(result.targets.calories).toBe(Math.round(2600 * 1.15));
  });

  it('uses remote API when local food search has no results', async () => {
    nutritionRepository.searchFoods.mockResolvedValue({ data: [], total: 0 });
    foodApiClient.search.mockResolvedValue([]);

    const result = await service.searchFoods('rice', 1, 20);

    expect(result.total).toBe(0);
    expect(foodApiClient.search.mock.calls[0]).toEqual(['rice', 1, 20]);
  });
});
