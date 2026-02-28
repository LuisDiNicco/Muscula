import { Injectable } from '@nestjs/common';
import {
  IBodyMetricRepository,
  RecordBodyMetricInput,
} from '../../../../application/interfaces/body-metric-repository.interface';
import { BodyMetricEntity } from '../../../../domain/entities/body-metric.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaBodyMetricRepository implements IBodyMetricRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async record(
    userId: string,
    input: RecordBodyMetricInput,
  ): Promise<BodyMetricEntity> {
    const row = await this.prismaService.bodyMetric.upsert({
      where: {
        userId_date: {
          userId,
          date: this.normalizeDate(input.date),
        },
      },
      create: {
        userId,
        date: this.normalizeDate(input.date),
        weightKg: input.weightKg,
        waistCm: input.waistCm,
        chestCm: input.chestCm,
        bicepsLeftCm: input.armCm,
        bicepsRightCm: input.armCm,
        thighLeftCm: input.thighCm,
        thighRightCm: input.thighCm,
      },
      update: {
        weightKg: input.weightKg,
        waistCm: input.waistCm,
        chestCm: input.chestCm,
        bicepsLeftCm: input.armCm,
        bicepsRightCm: input.armCm,
        thighLeftCm: input.thighCm,
        thighRightCm: input.thighCm,
      },
    });

    return this.toEntity(row);
  }

  async list(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<BodyMetricEntity[]> {
    const rows = await this.prismaService.bodyMetric.findMany({
      where: {
        userId,
        date: {
          gte: this.normalizeDate(from),
          lte: this.normalizeDate(to),
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return rows.map((row) => this.toEntity(row));
  }

  async getRecentWeights(
    userId: string,
    days: number,
  ): Promise<Array<{ date: Date; weightKg: number }>> {
    const rows = await this.prismaService.bodyMetric.findMany({
      where: {
        userId,
        weightKg: {
          not: null,
        },
        date: {
          gte: new Date(Date.now() - Math.max(days, 1) * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        date: true,
        weightKg: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return rows
      .filter(
        (row): row is { date: Date; weightKg: number } => row.weightKg !== null,
      )
      .map((row) => ({
        date: row.date,
        weightKg: row.weightKg,
      }));
  }

  private normalizeDate(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  private toEntity(row: {
    id: string;
    userId: string;
    date: Date;
    weightKg: number | null;
    chestCm: number | null;
    waistCm: number | null;
    bicepsLeftCm: number | null;
    bicepsRightCm: number | null;
    thighLeftCm: number | null;
    thighRightCm: number | null;
    createdAt: Date;
    updatedAt: Date;
  }): BodyMetricEntity {
    const armCm =
      row.bicepsLeftCm !== null && row.bicepsRightCm !== null
        ? Number(((row.bicepsLeftCm + row.bicepsRightCm) / 2).toFixed(1))
        : (row.bicepsLeftCm ?? row.bicepsRightCm ?? null);

    const thighCm =
      row.thighLeftCm !== null && row.thighRightCm !== null
        ? Number(((row.thighLeftCm + row.thighRightCm) / 2).toFixed(1))
        : (row.thighLeftCm ?? row.thighRightCm ?? null);

    return new BodyMetricEntity({
      id: row.id,
      userId: row.userId,
      date: row.date,
      weightKg: row.weightKg,
      bodyFatPercentage: null,
      waistCm: row.waistCm,
      chestCm: row.chestCm,
      armCm,
      thighCm,
      notes: null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
