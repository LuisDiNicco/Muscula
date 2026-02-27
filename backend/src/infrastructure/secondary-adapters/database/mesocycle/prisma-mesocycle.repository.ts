import { Injectable } from '@nestjs/common';
import {
  CreateMesocycleInput,
  IMesocycleRepository,
  MesocycleFilters,
  UpdateMesocycleInput,
} from '../../../../application/interfaces/mesocycle-repository.interface';
import { MesocycleEntity } from '../../../../domain/entities/mesocycle.entity';
import { PlannedExerciseEntity } from '../../../../domain/entities/planned-exercise.entity';
import { TrainingDayEntity } from '../../../../domain/entities/training-day.entity';
import { MesocycleStatus, TrainingObjective } from '../../../../domain/enums';
import { EntityNotFoundError } from '../../../../domain/errors/entity-not-found.error';
import { PrismaService } from '../prisma/prisma.service';

type RawMesocycle = {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  durationWeeks: number;
  objective: string;
  includeDeload: boolean;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  trainingDays: Array<{
    id: string;
    mesocycleId: string;
    name: string;
    dayOrder: number;
    createdAt: Date;
    updatedAt: Date;
    plannedExercises: Array<{
      id: string;
      trainingDayId: string;
      exerciseId: string;
      exerciseOrder: number;
      targetSets: number;
      targetRepsMin: number;
      targetRepsMax: number;
      targetRir: number;
      tempo: string | null;
      supersetGroup: number | null;
      setupNotes: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }>;
};

@Injectable()
export class PrismaMesocycleRepository implements IMesocycleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllByUser(
    userId: string,
    filters: MesocycleFilters,
    page: number,
    limit: number,
  ): Promise<{ data: MesocycleEntity[]; total: number }> {
    const where = {
      userId,
      deletedAt: null,
      status: filters.status,
      objective: filters.objective,
      name:
        filters.search === undefined || filters.search.trim().length === 0
          ? undefined
          : {
              contains: filters.search,
              mode: 'insensitive' as const,
            },
    };

    const [rows, total] = await Promise.all([
      this.prismaService.mesocycle.findMany({
        where,
        include: {
          trainingDays: {
            orderBy: { dayOrder: 'asc' },
            include: {
              plannedExercises: {
                orderBy: { exerciseOrder: 'asc' },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          updatedAt: 'desc',
        },
      }),
      this.prismaService.mesocycle.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.toEntity(row as RawMesocycle)),
      total,
    };
  }

  async findById(userId: string, id: string): Promise<MesocycleEntity | null> {
    const row = await this.prismaService.mesocycle.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: {
        trainingDays: {
          orderBy: { dayOrder: 'asc' },
          include: {
            plannedExercises: {
              orderBy: { exerciseOrder: 'asc' },
            },
          },
        },
      },
    });

    if (row === null) {
      return null;
    }

    return this.toEntity(row as RawMesocycle);
  }

  async findActiveByUser(userId: string): Promise<MesocycleEntity | null> {
    const row = await this.prismaService.mesocycle.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      include: {
        trainingDays: {
          orderBy: { dayOrder: 'asc' },
          include: {
            plannedExercises: {
              orderBy: { exerciseOrder: 'asc' },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (row === null) {
      return null;
    }

    return this.toEntity(row as RawMesocycle);
  }

  async create(input: CreateMesocycleInput): Promise<MesocycleEntity> {
    const created = await this.prismaService.mesocycle.create({
      data: {
        userId: input.userId,
        name: input.name,
        description: input.description,
        durationWeeks: input.durationWeeks,
        objective: input.objective,
        includeDeload: input.includeDeload,
        trainingDays: {
          create: input.trainingDays.map((day) => ({
            name: day.name,
            dayOrder: day.dayOrder,
            plannedExercises: {
              create: day.plannedExercises.map((plannedExercise) => ({
                exerciseId: plannedExercise.exerciseId,
                exerciseOrder: plannedExercise.exerciseOrder,
                targetSets: plannedExercise.targetSets,
                targetRepsMin: plannedExercise.targetRepsMin,
                targetRepsMax: plannedExercise.targetRepsMax,
                targetRir: plannedExercise.targetRir,
                tempo: plannedExercise.tempo,
                supersetGroup: plannedExercise.supersetGroup,
                setupNotes: plannedExercise.setupNotes,
              })),
            },
          })),
        },
      },
      include: {
        trainingDays: {
          orderBy: { dayOrder: 'asc' },
          include: {
            plannedExercises: {
              orderBy: { exerciseOrder: 'asc' },
            },
          },
        },
      },
    });

    return this.toEntity(created as RawMesocycle);
  }

  async update(
    userId: string,
    id: string,
    input: UpdateMesocycleInput,
  ): Promise<MesocycleEntity> {
    const existing = await this.prismaService.mesocycle.findFirst({
      where: { id, userId, deletedAt: null },
      select: { id: true },
    });

    if (existing === null) {
      throw new EntityNotFoundError('Mesocycle', id);
    }

    await this.prismaService.$transaction(async (tx) => {
      await tx.mesocycle.update({
        where: { id: existing.id },
        data: {
          name: input.name,
          description: input.description,
          durationWeeks: input.durationWeeks,
          objective: input.objective,
          includeDeload: input.includeDeload,
        },
      });

      await tx.trainingDay.deleteMany({
        where: { mesocycleId: existing.id },
      });

      for (const day of input.trainingDays) {
        await tx.trainingDay.create({
          data: {
            mesocycleId: existing.id,
            name: day.name,
            dayOrder: day.dayOrder,
            plannedExercises: {
              create: day.plannedExercises.map((plannedExercise) => ({
                exerciseId: plannedExercise.exerciseId,
                exerciseOrder: plannedExercise.exerciseOrder,
                targetSets: plannedExercise.targetSets,
                targetRepsMin: plannedExercise.targetRepsMin,
                targetRepsMax: plannedExercise.targetRepsMax,
                targetRir: plannedExercise.targetRir,
                tempo: plannedExercise.tempo,
                supersetGroup: plannedExercise.supersetGroup,
                setupNotes: plannedExercise.setupNotes,
              })),
            },
          },
        });
      }
    });

    const updated = await this.prismaService.mesocycle.findUniqueOrThrow({
      where: { id: existing.id },
      include: {
        trainingDays: {
          orderBy: { dayOrder: 'asc' },
          include: {
            plannedExercises: {
              orderBy: { exerciseOrder: 'asc' },
            },
          },
        },
      },
    });

    return this.toEntity(updated as RawMesocycle);
  }

  async softDelete(userId: string, id: string): Promise<void> {
    await this.prismaService.mesocycle.updateMany({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
        status: 'ARCHIVED',
      },
    });
  }

  async duplicate(userId: string, id: string): Promise<MesocycleEntity> {
    const source = await this.findById(userId, id);
    if (source === null) {
      throw new EntityNotFoundError('Mesocycle', id);
    }

    return this.create({
      userId,
      name: `${source.name} (Copia)`,
      description: source.description ?? undefined,
      durationWeeks: source.durationWeeks,
      objective: source.objective,
      includeDeload: source.includeDeload,
      trainingDays: source.trainingDays.map((day) => ({
        name: day.name,
        dayOrder: day.dayOrder,
        plannedExercises: day.getExercisesInOrder().map((plannedExercise) => ({
          exerciseId: plannedExercise.exerciseId,
          exerciseOrder: plannedExercise.exerciseOrder,
          targetSets: plannedExercise.targetSets,
          targetRepsMin: plannedExercise.targetRepsMin,
          targetRepsMax: plannedExercise.targetRepsMax,
          targetRir: plannedExercise.targetRir,
          tempo: plannedExercise.tempo ?? undefined,
          supersetGroup: plannedExercise.supersetGroup ?? undefined,
          setupNotes: plannedExercise.setupNotes ?? undefined,
        })),
      })),
    });
  }

  async activate(userId: string, id: string): Promise<void> {
    await this.prismaService.$transaction([
      this.prismaService.mesocycle.updateMany({
        where: {
          userId,
          status: 'ACTIVE',
          deletedAt: null,
        },
        data: {
          status: 'ARCHIVED',
        },
      }),
      this.prismaService.mesocycle.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          startedAt: new Date(),
          completedAt: null,
        },
      }),
    ]);
  }

  async complete(userId: string, id: string): Promise<void> {
    await this.prismaService.mesocycle.updateMany({
      where: {
        id,
        userId,
        status: 'ACTIVE',
        deletedAt: null,
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  private toEntity(row: RawMesocycle): MesocycleEntity {
    return new MesocycleEntity({
      id: row.id,
      userId: row.userId,
      name: row.name,
      description: row.description,
      durationWeeks: row.durationWeeks,
      objective: row.objective as TrainingObjective,
      includeDeload: row.includeDeload,
      status: row.status as MesocycleStatus,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      trainingDays: row.trainingDays
        .sort((left, right) => left.dayOrder - right.dayOrder)
        .map(
          (day) =>
            new TrainingDayEntity({
              id: day.id,
              mesocycleId: day.mesocycleId,
              name: day.name,
              dayOrder: day.dayOrder,
              createdAt: day.createdAt,
              updatedAt: day.updatedAt,
              plannedExercises: day.plannedExercises
                .sort((left, right) => left.exerciseOrder - right.exerciseOrder)
                .map(
                  (plannedExercise) =>
                    new PlannedExerciseEntity({
                      id: plannedExercise.id,
                      trainingDayId: plannedExercise.trainingDayId,
                      exerciseId: plannedExercise.exerciseId,
                      exerciseOrder: plannedExercise.exerciseOrder,
                      targetSets: plannedExercise.targetSets,
                      targetRepsMin: plannedExercise.targetRepsMin,
                      targetRepsMax: plannedExercise.targetRepsMax,
                      targetRir: plannedExercise.targetRir,
                      tempo: plannedExercise.tempo,
                      supersetGroup: plannedExercise.supersetGroup,
                      setupNotes: plannedExercise.setupNotes,
                      createdAt: plannedExercise.createdAt,
                      updatedAt: plannedExercise.updatedAt,
                    }),
                ),
            }),
        ),
    });
  }
}
