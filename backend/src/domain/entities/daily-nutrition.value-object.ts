import { FoodEntryEntity } from './food-entry.entity';

export type DailyNutritionTotals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export class DailyNutrition {
  static calculateTotals(entries: FoodEntryEntity[]): DailyNutritionTotals {
    return entries.reduce<DailyNutritionTotals>(
      (totals, entry) => ({
        calories: Number((totals.calories + entry.calories).toFixed(1)),
        protein: Number((totals.protein + entry.protein).toFixed(1)),
        carbs: Number((totals.carbs + entry.carbs).toFixed(1)),
        fat: Number((totals.fat + entry.fat).toFixed(1)),
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    );
  }
}
