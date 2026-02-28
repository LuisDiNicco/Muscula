import { BodyMetricEntity } from '../../domain/entities/body-metric.entity';

export const BODY_METRIC_REPOSITORY = 'BODY_METRIC_REPOSITORY';

export type RecordBodyMetricInput = {
  date: Date;
  weightKg?: number;
  bodyFatPercentage?: number;
  waistCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  notes?: string;
};

export interface IBodyMetricRepository {
  record(
    userId: string,
    input: RecordBodyMetricInput,
  ): Promise<BodyMetricEntity>;
  list(userId: string, from: Date, to: Date): Promise<BodyMetricEntity[]>;
  getRecentWeights(
    userId: string,
    days: number,
  ): Promise<Array<{ date: Date; weightKg: number }>>;
}
