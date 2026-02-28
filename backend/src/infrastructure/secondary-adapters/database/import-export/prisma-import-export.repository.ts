import { Injectable } from '@nestjs/common';
import {
  type ExportBodyMetricRow,
  type ExportNutritionRow,
  type ExportSessionSetRow,
  type IImportExportRepository,
  type ImportedSessionInput,
  type ImportExerciseCandidate,
} from '../../../../application/interfaces/import-export-repository.interface';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaImportExportRepository implements IImportExportRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getSessionRows(userId: string): Promise<ExportSessionSetRow[]> {
    const sessions = await this.prismaService.session.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        startedAt: 'asc',
      },
      include: {
        exercises: {
          orderBy: {
            exerciseOrder: 'asc',
          },
          include: {
            exercise: {
              select: {
                nameEs: true,
                nameEn: true,
              },
            },
            sets: {
              orderBy: {
                setOrder: 'asc',
              },
            },
          },
        },
      },
    });

    const rows: ExportSessionSetRow[] = [];

    for (const session of sessions) {
      for (const exercise of session.exercises) {
        for (const set of exercise.sets) {
          rows.push({
            sessionId: session.id,
            status: session.status,
            startedAt: session.startedAt,
            finishedAt: session.finishedAt,
            durationMinutes: session.durationMinutes,
            exerciseName: exercise.exercise.nameEn ?? exercise.exercise.nameEs,
            setOrder: set.setOrder,
            weightKg: set.weightKg,
            reps: set.reps,
            rir: set.rir,
            completed: set.completed,
            skipped: set.skipped,
          });
        }
      }
    }

    return rows;
  }

  async getNutritionRows(userId: string): Promise<ExportNutritionRow[]> {
    const meals = await this.prismaService.meal.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: 'asc',
      },
      include: {
        entries: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    const rows: ExportNutritionRow[] = [];

    for (const meal of meals) {
      for (const entry of meal.entries) {
        rows.push({
          mealDate: meal.date,
          mealType: meal.mealType,
          foodName: entry.name,
          grams: entry.quantityG,
          calories: entry.caloriesKcal,
          protein: entry.proteinG,
          carbs: entry.carbsG,
          fat: entry.fatG,
        });
      }
    }

    return rows;
  }

  async getBodyMetricRows(userId: string): Promise<ExportBodyMetricRow[]> {
    const rows = await this.prismaService.bodyMetric.findMany({
      where: { userId },
      orderBy: {
        date: 'asc',
      },
    });

    return rows.map((row) => ({
      date: row.date,
      weightKg: row.weightKg,
      neckCm: row.neckCm,
      chestCm: row.chestCm,
      waistCm: row.waistCm,
      hipCm: row.hipCm,
    }));
  }

  async findExerciseCandidatesByNames(
    names: string[],
  ): Promise<ImportExerciseCandidate[]> {
    if (names.length === 0) {
      return [];
    }

    const rows = await this.prismaService.exercise.findMany({
      where: {
        OR: [
          {
            nameEs: {
              in: names,
              mode: 'insensitive',
            },
          },
          {
            nameEn: {
              in: names,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        nameEs: true,
        nameEn: true,
      },
    });

    return rows;
  }

  async createCustomExercise(userId: string, name: string): Promise<string> {
    const created = await this.prismaService.exercise.create({
      data: {
        nameEs: name,
        nameEn: name,
        movementPattern: 'ISOLATION',
        difficulty: 'BEGINNER',
        equipmentType: 'NONE',
        isCompound: false,
        isCustom: true,
        createdByUserId: userId,
        equipmentNeeded: {
          create: [
            {
              equipment: 'NONE',
            },
          ],
        },
      },
      select: {
        id: true,
      },
    });

    return created.id;
  }

  async persistImportedSessions(
    userId: string,
    sessions: ImportedSessionInput[],
  ): Promise<number> {
    if (sessions.length === 0) {
      return 0;
    }

    await this.prismaService.$transaction(async (tx) => {
      for (const sessionInput of sessions) {
        const session = await tx.session.create({
          data: {
            userId,
            status: 'COMPLETED',
            startedAt: sessionInput.startedAt,
            finishedAt: sessionInput.finishedAt,
            durationMinutes: Math.max(
              0,
              Math.round(
                (sessionInput.finishedAt.getTime() -
                  sessionInput.startedAt.getTime()) /
                  60000,
              ),
            ),
            sessionNotes: 'Imported from external app',
          },
          select: {
            id: true,
          },
        });

        for (const exerciseInput of sessionInput.exercises) {
          const sessionExercise = await tx.sessionExercise.create({
            data: {
              sessionId: session.id,
              exerciseId: exerciseInput.exerciseId,
              exerciseOrder: exerciseInput.exerciseOrder,
            },
            select: {
              id: true,
            },
          });

          if (exerciseInput.sets.length > 0) {
            await tx.workingSet.createMany({
              data: exerciseInput.sets.map((set) => ({
                sessionExerciseId: sessionExercise.id,
                setOrder: set.setOrder,
                weightKg: set.weightKg,
                reps: set.reps,
                rir: 2,
                completed: true,
                skipped: false,
              })),
            });
          }
        }
      }
    });

    return sessions.length;
  }
}
