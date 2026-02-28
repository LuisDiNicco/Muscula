import { Inject, Injectable } from '@nestjs/common';
import {
  BODY_METRIC_REPOSITORY,
  type IBodyMetricRepository,
  RecordBodyMetricInput,
} from '../interfaces/body-metric-repository.interface';
import { AchievementService } from './achievement.service';

export type WeightTrendPoint = {
  date: Date;
  weightKg: number;
  movingAverage7d: number;
};

@Injectable()
export class BodyMetricService {
  constructor(
    @Inject(BODY_METRIC_REPOSITORY)
    private readonly bodyMetricRepository: IBodyMetricRepository,
    private readonly achievementService: AchievementService,
  ) {}

  async recordMetrics(
    userId: string,
    input: RecordBodyMetricInput,
  ): Promise<void> {
    await this.bodyMetricRepository.record(userId, input);

    if (input.weightKg !== undefined) {
      await this.achievementService.evaluateAchievements(
        userId,
        'WEIGHT_LOGGED',
      );
    }
  }

  async getMetrics(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<Array<{ date: Date; weightKg: number | null }>> {
    const data = await this.bodyMetricRepository.list(userId, from, to);
    return data.map((metric) => ({
      date: metric.date,
      weightKg: metric.weightKg,
    }));
  }

  async getWeightTrend(
    userId: string,
    days: number,
  ): Promise<WeightTrendPoint[]> {
    const points = await this.bodyMetricRepository.getRecentWeights(
      userId,
      days,
    );

    return points.map((point, index) => {
      const window = points.slice(Math.max(0, index - 6), index + 1);
      const movingAverage =
        window.reduce((sum, item) => sum + item.weightKg, 0) /
        Math.max(1, window.length);

      return {
        date: point.date,
        weightKg: point.weightKg,
        movingAverage7d: Number(movingAverage.toFixed(2)),
      };
    });
  }
}
