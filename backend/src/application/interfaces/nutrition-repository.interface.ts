import { FoodEntryEntity } from '../../domain/entities/food-entry.entity';
import { FoodEntity } from '../../domain/entities/food.entity';
import { MealEntity } from '../../domain/entities/meal.entity';
import { BodyMode, MealType } from '../../domain/enums';

export const NUTRITION_REPOSITORY = 'NUTRITION_REPOSITORY';

export type MealWithEntries = {
  meal: MealEntity;
  entries: FoodEntryEntity[];
};

export type AddFoodEntryInput = {
  foodId?: string;
  customFoodName?: string;
  grams: number;
};

export type CreateCustomFoodInput = {
  name: string;
  brand?: string;
  barcode?: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
};

export type DailyCaloriesDataPoint = {
  date: Date;
  calories: number;
};

export interface INutritionRepository {
  getDailyMeals(userId: string, date: Date): Promise<MealWithEntries[]>;
  ensureMeal(
    userId: string,
    date: Date,
    mealType: MealType,
  ): Promise<MealEntity>;
  addFoodEntry(
    userId: string,
    mealId: string,
    input: AddFoodEntryInput,
  ): Promise<FoodEntryEntity>;
  deleteFoodEntry(userId: string, entryId: string): Promise<void>;
  searchFoods(
    query: string,
    page: number,
    limit: number,
  ): Promise<{ data: FoodEntity[]; total: number }>;
  searchFoodByBarcode(barcode: string): Promise<FoodEntity | null>;
  createCustomFood(
    userId: string,
    input: CreateCustomFoodInput,
  ): Promise<FoodEntity>;
  getDailyCalories(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<DailyCaloriesDataPoint[]>;
  getBodyMode(userId: string): Promise<BodyMode>;
  setBodyMode(userId: string, mode: BodyMode): Promise<BodyMode>;
}
