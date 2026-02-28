import { Inject, Injectable } from '@nestjs/common';
import {
  FOOD_API_CLIENT,
  type IFoodApiClient,
} from '../interfaces/food-api-client.interface';
import {
  AddFoodEntryInput,
  CreateCustomFoodInput,
  type INutritionRepository,
  NUTRITION_REPOSITORY,
} from '../interfaces/nutrition-repository.interface';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../interfaces/user-repository.interface';
import { BodyMode, MealType } from '../../domain/enums';
import { DailyNutrition } from '../../domain/entities/daily-nutrition.value-object';
import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import { ValidationError } from '../../domain/errors/validation.error';
import { TdeeCalculatorService } from './tdee-calculator.service';

export type DailyMacroTargets = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type DailyNutritionResult = {
  date: Date;
  bodyMode: BodyMode;
  meals: Array<{
    mealId: string;
    mealType: MealType;
    entries: Array<{
      id: string;
      name: string;
      grams: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }>;
  }>;
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  targets: DailyMacroTargets;
  tdee: number;
};

@Injectable()
export class NutritionService {
  constructor(
    @Inject(NUTRITION_REPOSITORY)
    private readonly nutritionRepository: INutritionRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(FOOD_API_CLIENT)
    private readonly foodApiClient: IFoodApiClient,
    private readonly tdeeCalculatorService: TdeeCalculatorService,
  ) {}

  async getDailyNutrition(
    userId: string,
    date: Date,
  ): Promise<DailyNutritionResult> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new EntityNotFoundError('User', userId);
    }

    const meals = await this.nutritionRepository.getDailyMeals(userId, date);
    const entries = meals.flatMap((meal) => meal.entries);
    const totals = DailyNutrition.calculateTotals(entries);
    const bodyMode = await this.getBodyMode(userId);
    const { tdee } = await this.tdeeCalculatorService.calculateTdee(userId);
    const targets = this.calculateTargets(
      bodyMode,
      tdee,
      user.currentWeightKg ?? 70,
    );

    return {
      date,
      bodyMode,
      meals: meals.map((meal) => ({
        mealId: meal.meal.id,
        mealType: meal.meal.mealType,
        entries: meal.entries.map((entry) => ({
          id: entry.id,
          name: entry.customFoodName ?? 'Food',
          grams: entry.grams,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
        })),
      })),
      totals,
      targets,
      tdee,
    };
  }

  async addFoodEntry(
    userId: string,
    mealId: string,
    input: AddFoodEntryInput,
  ): Promise<void> {
    await this.nutritionRepository.addFoodEntry(userId, mealId, input);
  }

  async deleteFoodEntry(userId: string, entryId: string): Promise<void> {
    await this.nutritionRepository.deleteFoodEntry(userId, entryId);
  }

  async searchFoods(
    query: string,
    page: number,
    limit: number,
  ): Promise<{
    data: Array<{ id: string; name: string; brand: string | null }>;
    total: number;
  }> {
    const normalized = query.trim();
    if (normalized.length === 0) {
      return { data: [], total: 0 };
    }

    const sanitizedPage = page > 0 ? page : 1;
    const sanitizedLimit = limit > 0 ? Math.min(limit, 100) : 20;

    const local = await this.nutritionRepository.searchFoods(
      normalized,
      sanitizedPage,
      sanitizedLimit,
    );
    if (local.total > 0) {
      return {
        total: local.total,
        data: local.data.map((food) => ({
          id: food.id,
          name: food.name,
          brand: food.brand,
        })),
      };
    }

    const remote = await this.foodApiClient.search(
      normalized,
      sanitizedPage,
      sanitizedLimit,
    );
    const cached = await this.nutritionRepository.cacheApiFoods(remote);

    return {
      total: cached.length,
      data: cached.map((food) => ({
        id: food.id,
        name: food.name,
        brand: food.brand,
      })),
    };
  }

  async searchFoodByBarcode(
    barcode: string,
  ): Promise<{ id: string; name: string; brand: string | null } | null> {
    const local = await this.nutritionRepository.searchFoodByBarcode(barcode);
    if (local !== null) {
      return {
        id: local.id,
        name: local.name,
        brand: local.brand,
      };
    }

    const remote = await this.foodApiClient.searchByBarcode(barcode);
    if (remote === null) {
      return null;
    }

    const cached = await this.nutritionRepository.cacheApiFoods([remote]);
    const food = cached[0] ?? remote;

    return {
      id: food.id,
      name: food.name,
      brand: food.brand,
    };
  }

  async createCustomFood(
    userId: string,
    input: CreateCustomFoodInput,
  ): Promise<{ id: string; name: string }> {
    const created = await this.nutritionRepository.createCustomFood(
      userId,
      input,
    );
    return {
      id: created.id,
      name: created.name,
    };
  }

  async getBodyMode(userId: string): Promise<BodyMode> {
    return this.nutritionRepository.getBodyMode(userId);
  }

  async setBodyMode(
    userId: string,
    mode: BodyMode,
  ): Promise<{ mode: BodyMode; targets: DailyMacroTargets }> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new EntityNotFoundError('User', userId);
    }

    const persistedMode = await this.nutritionRepository.setBodyMode(
      userId,
      mode,
    );

    const { tdee } = await this.tdeeCalculatorService.calculateTdee(userId);
    const targets = this.calculateTargets(
      mode,
      tdee,
      user.currentWeightKg ?? 70,
    );

    return {
      mode: persistedMode,
      targets,
    };
  }

  async ensureMeal(
    userId: string,
    date: Date,
    mealType: MealType,
  ): Promise<{ mealId: string }> {
    const meal = await this.nutritionRepository.ensureMeal(
      userId,
      date,
      mealType,
    );
    return { mealId: meal.id };
  }

  private calculateTargets(
    mode: BodyMode,
    tdee: number,
    weightKg: number,
  ): DailyMacroTargets {
    const config = this.getBodyModeConfig(mode);

    const calories = Math.max(
      1200,
      Math.round(tdee * (1 + config.caloriesDelta)),
    );
    const protein = Number((weightKg * config.proteinPerKg).toFixed(1));
    const proteinKcal = protein * 4;

    const fatKcal = calories * 0.25;
    const fat = Number((fatKcal / 9).toFixed(1));

    const carbsKcal = Math.max(0, calories - proteinKcal - fatKcal);
    const carbs = Number((carbsKcal / 4).toFixed(1));

    return {
      calories,
      protein,
      carbs,
      fat,
    };
  }

  private getBodyModeConfig(mode: BodyMode): {
    caloriesDelta: number;
    proteinPerKg: number;
  } {
    if (mode === BodyMode.BULK) {
      return { caloriesDelta: 0.15, proteinPerKg: 1.8 };
    }

    if (mode === BodyMode.CUT) {
      return { caloriesDelta: -0.2, proteinPerKg: 2.4 };
    }

    if (mode === BodyMode.RECOMPOSITION) {
      return { caloriesDelta: -0.1, proteinPerKg: 2.4 };
    }

    if (mode === BodyMode.MAINTENANCE) {
      return { caloriesDelta: 0, proteinPerKg: 2.0 };
    }

    throw new ValidationError('Invalid body mode');
  }
}
