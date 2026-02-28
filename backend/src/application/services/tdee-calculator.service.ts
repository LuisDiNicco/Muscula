import { Inject, Injectable } from '@nestjs/common';
import {
  type IBodyMetricRepository,
  BODY_METRIC_REPOSITORY,
} from '../interfaces/body-metric-repository.interface';
import {
  type DailyCaloriesDataPoint,
  type INutritionRepository,
  NUTRITION_REPOSITORY,
} from '../interfaces/nutrition-repository.interface';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../interfaces/user-repository.interface';
import { ActivityLevel, Gender } from '../../domain/enums';
import { ValidationError } from '../../domain/errors/validation.error';

export type TdeeCalculationResult = {
  tdee: number;
  confidence: 'estimado' | 'calibrando' | 'preciso';
};

@Injectable()
export class TdeeCalculatorService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(NUTRITION_REPOSITORY)
    private readonly nutritionRepository: INutritionRepository,
    @Inject(BODY_METRIC_REPOSITORY)
    private readonly bodyMetricRepository: IBodyMetricRepository,
  ) {}

  async calculateTdee(userId: string): Promise<TdeeCalculationResult> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new ValidationError('User not found for TDEE calculation');
    }

    const to = new Date();
    const from = new Date(to.getTime() - 28 * 24 * 60 * 60 * 1000);

    const [dailyCalories, recentWeights] = await Promise.all([
      this.nutritionRepository.getDailyCalories(userId, from, to),
      this.bodyMetricRepository.getRecentWeights(userId, 28),
    ]);

    const daysWithCalories = dailyCalories.length;
    const daysWithWeight = recentWeights.length;

    if (daysWithCalories < 14 || daysWithWeight < 14) {
      return {
        tdee: this.getStaticTdee(user),
        confidence: 'estimado',
      };
    }

    const startWeight = this.averageWeight(recentWeights.slice(0, 7));
    const endWeight = this.averageWeight(recentWeights.slice(-7));

    const deltaKg = endWeight - startWeight;
    const periodDays = Math.max(
      1,
      Math.round(
        (recentWeights.at(-1)!.date.getTime() -
          recentWeights[0].date.getTime()) /
          (24 * 60 * 60 * 1000),
      ),
    );
    const surplusPerDay = (deltaKg * 7700) / periodDays;
    const avgCalories = this.averageCalories(dailyCalories);
    const calculatedTdee = avgCalories - surplusPerDay;

    const clamped = Math.max(1200, Math.min(6000, calculatedTdee));

    return {
      tdee: this.roundToNearest(clamped, 10),
      confidence:
        daysWithWeight >= 28 && daysWithCalories >= 28
          ? 'preciso'
          : 'calibrando',
    };
  }

  getStaticTdee(user: {
    dateOfBirth: Date | null;
    currentWeightKg: number | null;
    heightCm: number | null;
    gender: Gender | null;
    activityLevel: ActivityLevel;
  }): number {
    const weightKg = user.currentWeightKg ?? 70;
    const heightCm = user.heightCm ?? 170;
    const age = this.calculateAge(user.dateOfBirth);

    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    const bmr = user.gender === Gender.MALE ? base + 5 : base - 161;

    const factors: Record<ActivityLevel, number> = {
      [ActivityLevel.SEDENTARY]: 1.2,
      [ActivityLevel.LIGHTLY_ACTIVE]: 1.375,
      [ActivityLevel.MODERATELY_ACTIVE]: 1.55,
      [ActivityLevel.VERY_ACTIVE]: 1.725,
      [ActivityLevel.EXTREMELY_ACTIVE]: 1.9,
    };

    return this.roundToNearest(bmr * factors[user.activityLevel], 10);
  }

  private calculateAge(dateOfBirth: Date | null): number {
    if (dateOfBirth === null) {
      return 30;
    }

    const today = new Date();
    const yearDiff = today.getUTCFullYear() - dateOfBirth.getUTCFullYear();
    const beforeBirthday =
      today.getUTCMonth() < dateOfBirth.getUTCMonth() ||
      (today.getUTCMonth() === dateOfBirth.getUTCMonth() &&
        today.getUTCDate() < dateOfBirth.getUTCDate());

    return Math.max(18, yearDiff - (beforeBirthday ? 1 : 0));
  }

  private averageCalories(data: DailyCaloriesDataPoint[]): number {
    const total = data.reduce((sum, item) => sum + item.calories, 0);
    return total / Math.max(1, data.length);
  }

  private averageWeight(data: Array<{ date: Date; weightKg: number }>): number {
    const total = data.reduce((sum, item) => sum + item.weightKg, 0);
    return total / Math.max(1, data.length);
  }

  private roundToNearest(value: number, increment: number): number {
    return Math.round(value / increment) * increment;
  }
}
