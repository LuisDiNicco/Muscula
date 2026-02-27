import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddExerciseInput,
  AddSetInput,
  ITrainingSessionRepository,
  SessionDetail,
  SessionListFilters,
  StartSessionInput,
  UpdateSetInput,
} from '../../../../application/interfaces/training-session-repository.interface';
import { SessionEntity } from '../../../../domain/entities/session.entity';
import { SessionStatus } from '../../../../domain/enums';
import { EquipmentType } from '../../../../domain/enums/equipment-type.enum';
import { MovementPattern } from '../../../../domain/enums/movement-pattern.enum';
import { EntityNotFoundError } from '../../../../domain/errors/entity-not-found.error';
import {
  ISessionHistoryRepository,
  LastSessionPerformance,
} from '../../../../application/interfaces/session-history-repository.interface';

type SessionRow = {
  id: string;
  userId: string;
  mesocycleId: string | null;
  trainingDayId: string | null;
  weekNumber: number | null;
  status: SessionStatus;
  startedAt: Date;
  finishedAt: Date | null;
  durationMinutes: number | null;
  sessionNotes: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class PrismaSessionRepository
  implements ITrainingSessionRepository, ISessionHistoryRepository
{
  constructor(private readonly prismaService: PrismaService) {}

  async create(input: StartSessionInput): Promise<SessionEntity> {
    const created = await this.prismaService.$transaction(async (tx) => {
      const session = await tx.session.create({
        data: {
          userId: input.userId,
          mesocycleId: input.mesocycleId,
          trainingDayId: input.trainingDayId,
          weekNumber: input.weekNumber,
        },
      });

      if (input.trainingDayId !== undefined) {
        const plannedExercises = await tx.plannedExercise.findMany({
          where: {
            trainingDayId: input.trainingDayId,
          },
          orderBy: { exerciseOrder: 'asc' },
        });

        if (plannedExercises.length > 0) {
          await tx.sessionExercise.createMany({
            data: plannedExercises.map((plannedExercise) => ({
              sessionId: session.id,
              exerciseId: plannedExercise.exerciseId,
              exerciseOrder: plannedExercise.exerciseOrder,
            })),
          });
        }
      }

      return session;
    });

    return this.toEntity(created as SessionRow);
  }

  async findById(
    userId: string,
    sessionId: string,
  ): Promise<SessionEntity | null> {
    const row = await this.prismaService.session.findFirst({
      where: {
        id: sessionId,
        userId,
        deletedAt: null,
      },
    });

    return row === null ? null : this.toEntity(row as SessionRow);
  }

  async findActiveByUser(userId: string): Promise<SessionEntity | null> {
    const row = await this.prismaService.session.findFirst({
      where: {
        userId,
        status: SessionStatus.IN_PROGRESS,
        deletedAt: null,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    return row === null ? null : this.toEntity(row as SessionRow);
  }

  async findDetailById(
    userId: string,
    sessionId: string,
  ): Promise<SessionDetail | null> {
    const row = await this.prismaService.session.findFirst({
      where: {
        id: sessionId,
        userId,
        deletedAt: null,
      },
      include: {
        readinessScore: true,
        exercises: {
          orderBy: { exerciseOrder: 'asc' },
          include: {
            sets: {
              orderBy: { setOrder: 'asc' },
            },
            warmups: {
              orderBy: { setOrder: 'asc' },
            },
          },
        },
      },
    });

    if (row === null) {
      return null;
    }

    return {
      session: this.toEntity(row as SessionRow),
      readiness:
        row.readinessScore === null
          ? null
          : {
              sleepScore: row.readinessScore.sleepScore,
              stressScore: row.readinessScore.stressScore,
              domsScore: row.readinessScore.domsScore,
              totalScore: row.readinessScore.totalScore,
            },
      exercises: row.exercises.map((exercise) => ({
        id: exercise.id,
        exerciseId: exercise.exerciseId,
        exerciseOrder: exercise.exerciseOrder,
        originalExerciseId: exercise.originalExerciseId,
        sets: exercise.sets.map((set) => ({
          id: set.id,
          setOrder: set.setOrder,
          weightKg: set.weightKg,
          reps: set.reps,
          rir: set.rir,
          restTimeSec: set.restTimeSec,
          notes: set.notes,
          completed: set.completed,
          skipped: set.skipped,
        })),
        warmups: exercise.warmups.map((warmup) => ({
          id: warmup.id,
          setOrder: warmup.setOrder,
          weightKg: warmup.weightKg,
          reps: warmup.reps,
          completed: warmup.completed,
        })),
      })),
    };
  }

  async listByUser(
    userId: string,
    filters: SessionListFilters,
    page: number,
    limit: number,
  ): Promise<{ data: SessionEntity[]; total: number }> {
    const where = {
      userId,
      deletedAt: null,
      status: filters.status,
    };

    const [rows, total] = await Promise.all([
      this.prismaService.session.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          startedAt: 'desc',
        },
      }),
      this.prismaService.session.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.toEntity(row as SessionRow)),
      total,
    };
  }

  async addExercise(
    userId: string,
    sessionId: string,
    input: AddExerciseInput,
  ): Promise<void> {
    await this.assertSessionOwnership(userId, sessionId);

    await this.prismaService.sessionExercise.create({
      data: {
        sessionId,
        exerciseId: input.exerciseId,
        exerciseOrder: input.order,
      },
    });
  }

  async removeExercise(
    userId: string,
    sessionId: string,
    exerciseId: string,
  ): Promise<void> {
    await this.assertSessionOwnership(userId, sessionId);

    await this.prismaService.sessionExercise.deleteMany({
      where: {
        sessionId,
        exerciseId,
      },
    });
  }

  async addSet(
    userId: string,
    sessionId: string,
    exerciseId: string,
    input: AddSetInput,
  ): Promise<void> {
    await this.assertSessionOwnership(userId, sessionId);

    const sessionExercise = await this.prismaService.sessionExercise.findFirst({
      where: {
        sessionId,
        exerciseId,
      },
      include: {
        sets: {
          orderBy: { setOrder: 'desc' },
          take: 1,
        },
      },
    });

    if (sessionExercise === null) {
      throw new EntityNotFoundError('SessionExercise', exerciseId);
    }

    const nextOrder =
      sessionExercise.sets.length > 0
        ? sessionExercise.sets[0].setOrder + 1
        : 1;

    await this.prismaService.workingSet.create({
      data: {
        sessionExerciseId: sessionExercise.id,
        setOrder: nextOrder,
        weightKg: input.weightKg,
        reps: input.reps,
        rir: input.rir,
        restTimeSec: input.restTimeSec,
        notes: input.notes?.trim(),
        completed: input.completed,
        skipped: input.skipped,
      },
    });
  }

  async updateSet(
    userId: string,
    sessionId: string,
    setId: string,
    input: UpdateSetInput,
  ): Promise<void> {
    await this.assertSessionOwnership(userId, sessionId);

    await this.prismaService.workingSet.updateMany({
      where: {
        id: setId,
        sessionExercise: {
          sessionId,
        },
      },
      data: {
        weightKg: input.weightKg,
        reps: input.reps,
        rir: input.rir,
        restTimeSec: input.restTimeSec,
        notes: input.notes?.trim(),
        completed: input.completed,
        skipped: input.skipped,
      },
    });
  }

  async deleteSet(
    userId: string,
    sessionId: string,
    setId: string,
  ): Promise<void> {
    await this.assertSessionOwnership(userId, sessionId);

    await this.prismaService.workingSet.deleteMany({
      where: {
        id: setId,
        sessionExercise: {
          sessionId,
        },
      },
    });
  }

  async completeSession(
    userId: string,
    sessionId: string,
    notes?: string,
  ): Promise<void> {
    const session = await this.assertSessionOwnership(userId, sessionId);
    const finishedAt = new Date();
    const durationMinutes = Math.max(
      0,
      Math.round((finishedAt.getTime() - session.startedAt.getTime()) / 60000),
    );

    await this.prismaService.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.COMPLETED,
        finishedAt,
        durationMinutes,
        sessionNotes: notes,
      },
    });
  }

  async abandonSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.assertSessionOwnership(userId, sessionId);
    const finishedAt = new Date();
    const durationMinutes = Math.max(
      0,
      Math.round((finishedAt.getTime() - session.startedAt.getTime()) / 60000),
    );

    await this.prismaService.session.update({
      where: { id: sessionId },
      data: {
        status: SessionStatus.ABANDONED,
        finishedAt,
        durationMinutes,
      },
    });
  }

  async upsertReadiness(
    userId: string,
    sessionId: string,
    sleepScore: number,
    stressScore: number,
    domsScore: number,
    totalScore: number,
  ): Promise<void> {
    await this.assertSessionOwnership(userId, sessionId);

    await this.prismaService.readinessScore.upsert({
      where: {
        sessionId,
      },
      create: {
        userId,
        sessionId,
        sleepScore,
        stressScore,
        domsScore,
        totalScore,
      },
      update: {
        sleepScore,
        stressScore,
        domsScore,
        totalScore,
      },
    });
  }

  async findLastPerformance(
    userId: string,
    exerciseId: string,
  ): Promise<LastSessionPerformance | null> {
    const row = await this.prismaService.workingSet.findFirst({
      where: {
        sessionExercise: {
          exerciseId,
          session: {
            userId,
            status: SessionStatus.COMPLETED,
            deletedAt: null,
          },
        },
        completed: true,
        skipped: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        sessionExercise: {
          include: {
            exercise: true,
            session: {
              include: {
                trainingDay: {
                  include: {
                    plannedExercises: {
                      where: { exerciseId },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (row === null) {
      return null;
    }

    const plannedExercise =
      row.sessionExercise.session.trainingDay?.plannedExercises[0];

    return {
      weightKg: row.weightKg,
      reps: row.reps,
      rir: row.rir,
      rirObjective: plannedExercise?.targetRir ?? 2,
      repsObjectiveMin: plannedExercise?.targetRepsMin ?? row.reps,
      movementPattern: row.sessionExercise.exercise
        .movementPattern as MovementPattern,
      equipmentType: row.sessionExercise.exercise
        .equipmentType as EquipmentType,
    };
  }

  private async assertSessionOwnership(
    userId: string,
    sessionId: string,
  ): Promise<SessionRow> {
    const row = await this.prismaService.session.findFirst({
      where: {
        id: sessionId,
        userId,
        deletedAt: null,
      },
    });

    if (row === null) {
      throw new EntityNotFoundError('Session', sessionId);
    }

    return row as SessionRow;
  }

  private toEntity(row: SessionRow): SessionEntity {
    return new SessionEntity({
      id: row.id,
      userId: row.userId,
      mesocycleId: row.mesocycleId,
      trainingDayId: row.trainingDayId,
      weekNumber: row.weekNumber,
      status: row.status,
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      durationMinutes: row.durationMinutes,
      sessionNotes: row.sessionNotes,
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
