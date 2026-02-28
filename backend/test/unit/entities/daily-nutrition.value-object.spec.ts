import { DailyNutrition } from '../../../src/domain/entities/daily-nutrition.value-object';
import { FoodEntryEntity } from '../../../src/domain/entities/food-entry.entity';

describe('DailyNutrition', () => {
  const now = new Date('2026-02-28T10:00:00.000Z');

  const buildEntry = (
    id: string,
    calories: number,
    protein: number,
    carbs: number,
    fat: number,
  ): FoodEntryEntity =>
    new FoodEntryEntity({
      id,
      userId: 'user-1',
      mealId: 'meal-1',
      foodId: 'food-1',
      customFoodName: null,
      grams: 100,
      calories,
      protein,
      carbs,
      fat,
      createdAt: now,
      updatedAt: now,
    });

  it('returns zero totals for empty entries', () => {
    expect(DailyNutrition.calculateTotals([])).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    });
  });

  it('sums all macros and calories from entries', () => {
    const entries = [
      buildEntry('entry-1', 350.5, 32.2, 21.4, 12.5),
      buildEntry('entry-2', 210.4, 18.6, 30.8, 3.9),
      buildEntry('entry-3', 120.1, 6.1, 15.3, 4.2),
    ];

    expect(DailyNutrition.calculateTotals(entries)).toEqual({
      calories: 681,
      protein: 56.9,
      carbs: 67.5,
      fat: 20.6,
    });
  });
});
