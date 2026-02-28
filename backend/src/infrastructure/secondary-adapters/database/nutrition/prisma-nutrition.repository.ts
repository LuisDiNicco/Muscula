import { Injectable } from '@nestjs/common';
import { MealType as PrismaMealType } from '@prisma/client';
import {
  AddFoodEntryInput,
  CreateCustomFoodInput,
  DailyCaloriesDataPoint,
  INutritionRepository,
  MealWithEntries,
} from '../../../../application/interfaces/nutrition-repository.interface';
import { FoodEntryEntity } from '../../../../domain/entities/food-entry.entity';
import { FoodEntity } from '../../../../domain/entities/food.entity';
import { MealEntity } from '../../../../domain/entities/meal.entity';
import { BodyMode, FoodSource, MealType } from '../../../../domain/enums';
import { EntityNotFoundError } from '../../../../domain/errors/entity-not-found.error';
import { ValidationError } from '../../../../domain/errors/validation.error';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaNutritionRepository implements INutritionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getDailyMeals(userId: string, date: Date): Promise<MealWithEntries[]> {
    const rows = await this.prismaService.meal.findMany({
      where: {
        userId,
        date: this.normalizeDate(date),
      },
      include: {
        entries: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        mealType: 'asc',
      },
    });

    return rows.map((row) => ({
      meal: this.toMealEntity(row),
      entries: row.entries.map((entry) =>
        this.toFoodEntryEntity(entry, row.userId),
      ),
    }));
  }

  async ensureMeal(
    userId: string,
    date: Date,
    mealType: MealType,
  ): Promise<MealEntity> {
    const row = await this.prismaService.meal.upsert({
      where: {
        userId_date_mealType: {
          userId,
          date: this.normalizeDate(date),
          mealType: mealType as unknown as PrismaMealType,
        },
      },
      create: {
        userId,
        date: this.normalizeDate(date),
        mealType: mealType as unknown as PrismaMealType,
      },
      update: {},
    });

    return this.toMealEntity(row);
  }

  async addFoodEntry(
    userId: string,
    mealId: string,
    input: AddFoodEntryInput,
  ): Promise<FoodEntryEntity> {
    const meal = await this.prismaService.meal.findFirst({
      where: {
        id: mealId,
        userId,
      },
    });

    if (meal === null) {
      throw new EntityNotFoundError('Meal', mealId);
    }

    let name = input.customFoodName ?? '';
    let caloriesKcal = 0;
    let proteinG = 0;
    let carbsG = 0;
    let fatG = 0;

    if (input.foodId !== undefined) {
      const food = await this.prismaService.food.findUnique({
        where: { id: input.foodId },
      });

      if (food === null) {
        throw new EntityNotFoundError('Food', input.foodId);
      }

      name = food.name;
      const ratio = input.grams / 100;
      caloriesKcal = Number((food.caloriesPer100g * ratio).toFixed(1));
      proteinG = Number((food.proteinPer100g * ratio).toFixed(1));
      carbsG = Number((food.carbsPer100g * ratio).toFixed(1));
      fatG = Number((food.fatPer100g * ratio).toFixed(1));
    } else {
      if (name.trim().length === 0) {
        throw new ValidationError(
          'customFoodName is required when foodId is not provided',
        );
      }
    }

    const row = await this.prismaService.foodEntry.create({
      data: {
        mealId,
        foodId: input.foodId,
        name,
        quantityG: input.grams,
        caloriesKcal,
        proteinG,
        carbsG,
        fatG,
      },
      include: {
        meal: true,
      },
    });

    return this.toFoodEntryEntity(row, row.meal.userId);
  }

  async deleteFoodEntry(userId: string, entryId: string): Promise<void> {
    const row = await this.prismaService.foodEntry.findUnique({
      where: { id: entryId },
      include: {
        meal: true,
      },
    });

    if (row === null || row.meal.userId !== userId) {
      throw new EntityNotFoundError('FoodEntry', entryId);
    }

    await this.prismaService.foodEntry.delete({
      where: { id: entryId },
    });
  }

  async searchFoods(
    query: string,
    page: number,
    limit: number,
  ): Promise<{ data: FoodEntity[]; total: number }> {
    const where = {
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
        {
          brand: {
            contains: query,
            mode: 'insensitive' as const,
          },
        },
      ],
    };

    const [rows, total] = await Promise.all([
      this.prismaService.food.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      this.prismaService.food.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.toFoodEntity(row)),
      total,
    };
  }

  async searchFoodByBarcode(barcode: string): Promise<FoodEntity | null> {
    const row = await this.prismaService.food.findUnique({
      where: {
        barcode,
      },
    });

    if (row === null) {
      return null;
    }

    return this.toFoodEntity(row);
  }

  async createCustomFood(
    userId: string,
    input: CreateCustomFoodInput,
  ): Promise<FoodEntity> {
    const row = await this.prismaService.food.create({
      data: {
        name: input.name,
        brand: input.brand,
        barcode: input.barcode,
        caloriesPer100g: input.caloriesPer100g,
        proteinPer100g: input.proteinPer100g,
        carbsPer100g: input.carbsPer100g,
        fatPer100g: input.fatPer100g,
        source: 'USER',
        createdByUserId: userId,
      },
    });

    return this.toFoodEntity(row);
  }

  async getDailyCalories(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<DailyCaloriesDataPoint[]> {
    const rows = await this.prismaService.meal.findMany({
      where: {
        userId,
        date: {
          gte: this.normalizeDate(from),
          lte: this.normalizeDate(to),
        },
      },
      include: {
        entries: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    const caloriesByDay = new Map<string, number>();

    for (const meal of rows) {
      const day = meal.date.toISOString().slice(0, 10);
      const mealCalories = meal.entries.reduce(
        (sum, entry) => sum + entry.caloriesKcal,
        0,
      );
      caloriesByDay.set(
        day,
        Number(((caloriesByDay.get(day) ?? 0) + mealCalories).toFixed(1)),
      );
    }

    return Array.from(caloriesByDay.entries())
      .map(([day, calories]) => ({
        date: new Date(`${day}T00:00:00.000Z`),
        calories,
      }))
      .sort((left, right) => left.date.getTime() - right.date.getTime());
  }

  async cacheApiFoods(foods: FoodEntity[]): Promise<FoodEntity[]> {
    const cached: FoodEntity[] = [];

    for (const food of foods) {
      const data = food.toObject();
      const mappedSource =
        data.source === FoodSource.USER_CUSTOM ? 'USER' : 'API';

      let row:
        | {
            id: string;
            name: string;
            brand: string | null;
            barcode: string | null;
            caloriesPer100g: number;
            proteinPer100g: number;
            carbsPer100g: number;
            fatPer100g: number;
            source: string;
            createdByUserId: string | null;
            createdAt: Date;
            updatedAt: Date;
          }
        | undefined;

      if (data.barcode !== null) {
        row = await this.prismaService.food.upsert({
          where: {
            barcode: data.barcode,
          },
          create: {
            name: data.name,
            brand: data.brand,
            barcode: data.barcode,
            caloriesPer100g: data.caloriesPer100g,
            proteinPer100g: data.proteinPer100g,
            carbsPer100g: data.carbsPer100g,
            fatPer100g: data.fatPer100g,
            source: mappedSource,
            createdByUserId: null,
          },
          update: {
            name: data.name,
            brand: data.brand,
            caloriesPer100g: data.caloriesPer100g,
            proteinPer100g: data.proteinPer100g,
            carbsPer100g: data.carbsPer100g,
            fatPer100g: data.fatPer100g,
            source: mappedSource,
          },
        });
      } else {
        const existing = await this.prismaService.food.findFirst({
          where: {
            source: 'API',
            createdByUserId: null,
            name: data.name,
            brand: data.brand,
          },
        });

        if (existing !== null) {
          row = await this.prismaService.food.update({
            where: {
              id: existing.id,
            },
            data: {
              caloriesPer100g: data.caloriesPer100g,
              proteinPer100g: data.proteinPer100g,
              carbsPer100g: data.carbsPer100g,
              fatPer100g: data.fatPer100g,
            },
          });
        } else {
          row = await this.prismaService.food.create({
            data: {
              name: data.name,
              brand: data.brand,
              barcode: null,
              caloriesPer100g: data.caloriesPer100g,
              proteinPer100g: data.proteinPer100g,
              carbsPer100g: data.carbsPer100g,
              fatPer100g: data.fatPer100g,
              source: mappedSource,
              createdByUserId: null,
            },
          });
        }
      }

      cached.push(this.toFoodEntity(row));
    }

    return cached;
  }

  async getBodyMode(userId: string): Promise<BodyMode> {
    const rows = await this.prismaService.$queryRaw<
      Array<{ bodyMode: string }>
    >`
      SELECT "bodyMode"::text as "bodyMode"
      FROM "UserPreferences"
      WHERE "userId" = ${userId}
      LIMIT 1
    `;

    const preferences = rows[0];

    if (preferences === undefined) {
      return BodyMode.MAINTENANCE;
    }

    return preferences.bodyMode as BodyMode;
  }

  async setBodyMode(userId: string, mode: BodyMode): Promise<BodyMode> {
    await this.prismaService.userPreferences.upsert({
      where: {
        userId,
      },
      create: {
        userId,
      },
      update: {},
    });

    await this.prismaService.$executeRaw`
      UPDATE "UserPreferences"
      SET "bodyMode" = ${mode}::"BodyMode"
      WHERE "userId" = ${userId}
    `;

    return mode;
  }

  private normalizeDate(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private toMealEntity(row: {
    id: string;
    userId: string;
    date: Date;
    mealType: string;
    createdAt: Date;
    updatedAt: Date;
  }): MealEntity {
    return new MealEntity({
      id: row.id,
      userId: row.userId,
      date: row.date,
      mealType: row.mealType as MealType,
      notes: null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: null,
    });
  }

  private toFoodEntryEntity(
    row: {
      id: string;
      mealId: string;
      foodId: string | null;
      name: string;
      quantityG: number;
      caloriesKcal: number;
      proteinG: number;
      carbsG: number;
      fatG: number;
      createdAt: Date;
      updatedAt: Date;
    },
    userId: string,
  ): FoodEntryEntity {
    return new FoodEntryEntity({
      id: row.id,
      userId,
      mealId: row.mealId,
      foodId: row.foodId,
      customFoodName: row.foodId === null ? row.name : null,
      grams: row.quantityG,
      calories: row.caloriesKcal,
      protein: row.proteinG,
      carbs: row.carbsG,
      fat: row.fatG,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  private toFoodEntity(row: {
    id: string;
    name: string;
    brand: string | null;
    barcode: string | null;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
    source: string;
    createdByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): FoodEntity {
    return new FoodEntity({
      id: row.id,
      name: row.name,
      brand: row.brand,
      barcode: row.barcode,
      caloriesPer100g: row.caloriesPer100g,
      proteinPer100g: row.proteinPer100g,
      carbsPer100g: row.carbsPer100g,
      fatPer100g: row.fatPer100g,
      source:
        row.source === 'USER'
          ? FoodSource.USER_CUSTOM
          : FoodSource.OPEN_FOOD_FACTS,
      createdByUserId: row.createdByUserId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
