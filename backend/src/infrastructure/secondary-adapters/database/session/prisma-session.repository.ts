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
import { MuscleGroup, SessionStatus } from '../../../../domain/enums';
import { EquipmentType } from '../../../../domain/enums/equipment-type.enum';
import { MovementPattern } from '../../../../domain/enums/movement-pattern.enum';
import { EntityNotFoundError } from '../../../../domain/errors/entity-not-found.error';
import { ValidationError } from '../../../../domain/errors/validation.error';
import {
  ISessionHistoryRepository,
  LastSessionPerformance,
} from '../../../../application/interfaces/session-history-repository.interface';
import {
  IAnalyticsRepository,
  MuscleOneRmWeeklyPoint,
  MuscleVolumeSnapshot,
  VolumeLandmark,
} from '../../../../application/interfaces/analytics-repository.interface';

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
  implements
    ITrainingSessionRepository,
    ISessionHistoryRepository,
    IAnalyticsRepository
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

  async substituteExercise(
    userId: string,
    sessionId: string,
    oldExerciseId: string,
    newExerciseId: string,
  ): Promise<void> {
    await this.assertSessionOwnership(userId, sessionId);

    const sessionExercise = await this.prismaService.sessionExercise.findFirst({
      where: {
        sessionId,
        exerciseId: oldExerciseId,
      },
      orderBy: {
        exerciseOrder: 'asc',
      },
    });

    if (sessionExercise === null) {
      throw new EntityNotFoundError('SessionExercise', oldExerciseId);
    }

    await this.prismaService.sessionExercise.update({
      where: {
        id: sessionExercise.id,
      },
      data: {
        exerciseId: newExerciseId,
        originalExerciseId:
          sessionExercise.originalExerciseId ?? sessionExercise.exerciseId,
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
    if (session.status !== SessionStatus.IN_PROGRESS) {
      throw new ValidationError('Only IN_PROGRESS sessions can be completed');
    }

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
    if (session.status !== SessionStatus.IN_PROGRESS) {
      throw new ValidationError('Only IN_PROGRESS sessions can be abandoned');
    }

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

  async getEffectiveVolumeByMuscleGroup(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MuscleVolumeSnapshot[]> {
    const rows = await this.prismaService.$queryRaw<
      Array<{ muscleGroup: string; effectiveSets: number }>
    >`
      SELECT
        em."muscleGroup"::text as "muscleGroup",
        COUNT(*)::int as "effectiveSets"
      FROM "WorkingSet" ws
      INNER JOIN "SessionExercise" se ON se.id = ws."sessionExerciseId"
      INNER JOIN "Session" s ON s.id = se."sessionId"
      INNER JOIN "ExerciseMuscle" em ON em."primaryForId" = se."exerciseId"
      WHERE s."userId" = ${userId}
        AND s."status" = 'COMPLETED'
        AND s."deletedAt" IS NULL
        AND s."startedAt" >= ${startDate}
        AND s."startedAt" < ${endDate}
        AND ws."completed" = true
        AND ws."skipped" = false
        AND ws."rir" <= 4
      GROUP BY em."muscleGroup"
    `;

    return rows.map((row) => ({
      muscleGroup: row.muscleGroup as MuscleGroup,
      effectiveSets: row.effectiveSets,
    }));
  }

  async getUserVolumeLandmarks(userId: string): Promise<VolumeLandmark[]> {
    const rows = await this.prismaService.$queryRaw<
      Array<{ muscleGroup: string; mev: number; mrv: number }>
    >`
      SELECT
        uvl."muscleGroup"::text as "muscleGroup",
        uvl."mev" as "mev",
        uvl."mrv" as "mrv"
      FROM "UserVolumeLandmark" uvl
      WHERE uvl."userId" = ${userId}
    `;

    return rows.map((row) => ({
      muscleGroup: row.muscleGroup as MuscleGroup,
      mev: row.mev,
      mrv: row.mrv,
    }));
  }

  async getAverageReadiness(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number | null> {
    const rows = await this.prismaService.$queryRaw<
      Array<{ avgReadiness: number | null }>
    >`
      SELECT
        AVG(rs."totalScore")::float as "avgReadiness"
      FROM "ReadinessScore" rs
      INNER JOIN "Session" s ON s.id = rs."sessionId"
      WHERE s."userId" = ${userId}
        AND s."startedAt" >= ${startDate}
        AND s."startedAt" < ${endDate}
        AND s."deletedAt" IS NULL
    `;

    const average = rows[0]?.avgReadiness ?? null;

    if (average === null) {
      return null;
    }

    return Number(average.toFixed(2));
  }

  async getWeeklyEstimatedOneRmByMuscleGroup(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MuscleOneRmWeeklyPoint[]> {
    const rows = await this.prismaService.$queryRaw<
      Array<{
        weekStart: Date;
        muscleGroup: string;
        avgEstimatedOneRm: number;
      }>
    >`
      SELECT
        DATE_TRUNC('week', s."startedAt")::date as "weekStart",
        em."muscleGroup"::text as "muscleGroup",
        AVG(
          (
            (ws."weightKg" * (1 + ws."reps"::float / 30)) +
            (ws."weightKg" * (36 / (37 - ws."reps"::float)))
          ) / 2
        )::float as "avgEstimatedOneRm"
      FROM "WorkingSet" ws
      INNER JOIN "SessionExercise" se ON se.id = ws."sessionExerciseId"
      INNER JOIN "Session" s ON s.id = se."sessionId"
      INNER JOIN "ExerciseMuscle" em ON em."primaryForId" = se."exerciseId"
      WHERE s."userId" = ${userId}
        AND s."status" = 'COMPLETED'
        AND s."deletedAt" IS NULL
        AND s."startedAt" >= ${startDate}
        AND s."startedAt" < ${endDate}
        AND ws."completed" = true
        AND ws."skipped" = false
        AND ws."rir" <= 4
        AND ws."reps" BETWEEN 1 AND 10
      GROUP BY DATE_TRUNC('week', s."startedAt")::date, em."muscleGroup"
      ORDER BY DATE_TRUNC('week', s."startedAt")::date ASC
    `;

    return rows.map((row) => ({
      weekStart: new Date(row.weekStart),
      muscleGroup: row.muscleGroup as MuscleGroup,
      avgEstimatedOneRm: Number(row.avgEstimatedOneRm.toFixed(2)),
    }));
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
