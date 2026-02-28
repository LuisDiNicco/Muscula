import { Injectable } from '@nestjs/common';
import {
  type ImportedRoutineResult,
  IRoutineSharingRepository,
  type SharedRoutinePreview,
  type SharedRoutineSummary,
} from '../../../../application/interfaces/routine-sharing-repository.interface';
import { TrainingObjective } from '../../../../domain/enums';
import { EntityNotFoundError } from '../../../../domain/errors/entity-not-found.error';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaRoutineSharingRepository implements IRoutineSharingRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async codeExists(code: string): Promise<boolean> {
    const row = await this.prismaService.sharedRoutine.findUnique({
      where: { code },
      select: { id: true },
    });

    return row !== null;
  }

  async createShare(
    userId: string,
    mesocycleId: string,
    code: string,
    expiresAt: Date,
  ): Promise<SharedRoutineSummary> {
    const mesocycle = await this.prismaService.mesocycle.findFirst({
      where: {
        id: mesocycleId,
        userId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (mesocycle === null) {
      throw new EntityNotFoundError('Mesocycle', mesocycleId);
    }

    await this.prismaService.sharedRoutine.create({
      data: {
        mesocycleId,
        code,
        expiresAt,
      },
    });

    return {
      code,
      expiresAt,
    };
  }

  async getPreviewByCode(code: string): Promise<SharedRoutinePreview | null> {
    const now = new Date();

    const row = await this.prismaService.sharedRoutine.findFirst({
      where: {
        code,
        expiresAt: {
          gt: now,
        },
      },
      include: {
        mesocycle: {
          include: {
            trainingDays: {
              orderBy: { dayOrder: 'asc' },
              include: {
                plannedExercises: {
                  orderBy: {
                    exerciseOrder: 'asc',
                  },
                },
              },
            },
          },
        },
      },
    });

    if (row === null || row.mesocycle.deletedAt !== null) {
      return null;
    }

    return {
      code: row.code,
      expiresAt: row.expiresAt,
      viewCount: row.viewCount,
      mesocycle: {
        id: row.mesocycle.id,
        name: row.mesocycle.name,
        description: row.mesocycle.description,
        durationWeeks: row.mesocycle.durationWeeks,
        objective: row.mesocycle.objective as TrainingObjective,
        includeDeload: row.mesocycle.includeDeload,
        trainingDays: row.mesocycle.trainingDays.map((day) => ({
          name: day.name,
          dayOrder: day.dayOrder,
          plannedExercises: day.plannedExercises.map((plannedExercise) => ({
            exerciseId: plannedExercise.exerciseId,
            exerciseOrder: plannedExercise.exerciseOrder,
            targetSets: plannedExercise.targetSets,
            targetRepsMin: plannedExercise.targetRepsMin,
            targetRepsMax: plannedExercise.targetRepsMax,
            targetRir: plannedExercise.targetRir,
          })),
        })),
      },
    };
  }

  async incrementViewCount(code: string): Promise<void> {
    await this.prismaService.sharedRoutine.updateMany({
      where: { code },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }

  async importByCode(
    userId: string,
    code: string,
  ): Promise<ImportedRoutineResult> {
    const now = new Date();

    const sharedRoutine = await this.prismaService.sharedRoutine.findFirst({
      where: {
        code,
        expiresAt: {
          gt: now,
        },
      },
      include: {
        mesocycle: {
          include: {
            trainingDays: {
              include: {
                plannedExercises: true,
              },
            },
          },
        },
      },
    });

    if (sharedRoutine === null || sharedRoutine.mesocycle.deletedAt !== null) {
      throw new EntityNotFoundError('SharedRoutine', code);
    }

    const imported = await this.prismaService.$transaction(async (tx) => {
      const created = await tx.mesocycle.create({
        data: {
          userId,
          name: `${sharedRoutine.mesocycle.name} (Importado)`,
          description: sharedRoutine.mesocycle.description,
          durationWeeks: sharedRoutine.mesocycle.durationWeeks,
          objective: sharedRoutine.mesocycle.objective,
          includeDeload: sharedRoutine.mesocycle.includeDeload,
          status: 'DRAFT',
          trainingDays: {
            create: sharedRoutine.mesocycle.trainingDays
              .sort((left, right) => left.dayOrder - right.dayOrder)
              .map((day) => ({
                name: day.name,
                dayOrder: day.dayOrder,
                plannedExercises: {
                  create: day.plannedExercises
                    .sort(
                      (left, right) => left.exerciseOrder - right.exerciseOrder,
                    )
                    .map((plannedExercise) => ({
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
      });

      await tx.sharedRoutine.update({
        where: {
          id: sharedRoutine.id,
        },
        data: {
          importCount: {
            increment: 1,
          },
        },
      });

      return created;
    });

    return {
      mesocycleId: imported.id,
      name: imported.name,
    };
  }
}
