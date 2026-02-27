import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateExerciseInput,
  ExerciseFilters,
  IExerciseRepository,
} from '../../../../application/interfaces/exercise-repository.interface';
import { ExerciseEntity } from '../../../../domain/entities/exercise.entity';
import {
  DifficultyLevel,
  EquipmentType,
  MovementPattern,
  MuscleGroup,
} from '../../../../domain/enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaExerciseRepository implements IExerciseRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private buildMuscleFilter(
    muscleGroup: MuscleGroup | undefined,
  ): Prisma.ExerciseWhereInput | undefined {
    if (muscleGroup === undefined) {
      return undefined;
    }

    return {
      OR: [
        {
          primaryMuscles: {
            some: { muscleGroup },
          },
        },
        {
          secondaryMuscles: {
            some: { muscleGroup },
          },
        },
      ],
    };
  }

  private buildSearchFilter(
    query: string | undefined,
  ): Prisma.ExerciseWhereInput | undefined {
    const normalizedQuery = query?.trim();

    if (normalizedQuery === undefined || normalizedQuery.length === 0) {
      return undefined;
    }

    return {
      OR: [
        {
          nameEs: {
            contains: normalizedQuery,
            mode: 'insensitive',
          },
        },
        {
          nameEn: {
            contains: normalizedQuery,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  async findAll(
    filters: ExerciseFilters,
    page: number,
    limit: number,
  ): Promise<{ data: ExerciseEntity[]; total: number }> {
    const andConditions: Prisma.ExerciseWhereInput[] = [];
    const muscleFilter = this.buildMuscleFilter(filters.muscleGroup);
    const searchFilter = this.buildSearchFilter(filters.search);

    if (muscleFilter !== undefined) {
      andConditions.push(muscleFilter);
    }

    if (searchFilter !== undefined) {
      andConditions.push(searchFilter);
    }

    const where: Prisma.ExerciseWhereInput = {
      movementPattern: filters.movementPattern,
      difficulty: filters.difficulty,
      equipmentType: filters.equipmentType,
      ...(andConditions.length > 0 ? { AND: andConditions } : {}),
    };

    type ExerciseRow = Prisma.ExerciseGetPayload<{
      include: {
        primaryMuscles: true;
        secondaryMuscles: true;
      };
    }>;

    const [rows, total] = await Promise.all([
      this.prismaService.exercise.findMany({
        where,
        include: {
          primaryMuscles: true,
          secondaryMuscles: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          nameEs: 'asc',
        },
      }),
      this.prismaService.exercise.count({ where }),
    ]);

    const data = (rows as ExerciseRow[]).map((row) => this.toEntity(row));

    return {
      data,
      total,
    };
  }

  async findById(id: string): Promise<ExerciseEntity | null> {
    const row = await this.prismaService.exercise.findUnique({
      where: { id },
      include: {
        primaryMuscles: true,
        secondaryMuscles: true,
      },
    });

    if (row === null) {
      return null;
    }

    return this.toEntity(row);
  }

  async search(
    query: string,
    filters: ExerciseFilters,
  ): Promise<ExerciseEntity[]> {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length === 0) {
      return [];
    }

    const muscleFilter = this.buildMuscleFilter(filters.muscleGroup);

    const where: Prisma.ExerciseWhereInput = {
      movementPattern: filters.movementPattern,
      difficulty: filters.difficulty,
      equipmentType: filters.equipmentType,
      ...(muscleFilter !== undefined
        ? {
            AND: [
              {
                OR: [
                  {
                    nameEs: {
                      contains: normalizedQuery,
                      mode: 'insensitive',
                    },
                  },
                  {
                    nameEn: {
                      contains: normalizedQuery,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
              muscleFilter,
            ],
          }
        : {
            OR: [
              {
                nameEs: {
                  contains: normalizedQuery,
                  mode: 'insensitive',
                },
              },
              {
                nameEn: {
                  contains: normalizedQuery,
                  mode: 'insensitive',
                },
              },
            ],
          }),
    };

    const rows = await this.prismaService.exercise.findMany({
      where,
      include: {
        primaryMuscles: true,
        secondaryMuscles: true,
      },
      take: 30,
      orderBy: {
        nameEs: 'asc',
      },
    });

    return rows.map((row) => this.toEntity(row));
  }

  async findSubstitutes(
    exerciseId: string,
    equipmentTypes: EquipmentType[],
  ): Promise<ExerciseEntity[]> {
    const baseExercise = await this.prismaService.exercise.findUnique({
      where: { id: exerciseId },
      include: {
        primaryMuscles: true,
      },
    });

    if (baseExercise === null) {
      return [];
    }

    const primaryMuscles = baseExercise.primaryMuscles.map(
      (muscle) => muscle.muscleGroup,
    );

    const rows = await this.prismaService.exercise.findMany({
      where: {
        id: { not: exerciseId },
        movementPattern: baseExercise.movementPattern,
        equipmentType:
          equipmentTypes.length > 0 ? { in: equipmentTypes } : undefined,
      },
      include: {
        primaryMuscles: true,
        secondaryMuscles: true,
      },
      take: 20,
      orderBy: {
        difficulty: 'asc',
      },
    });

    return rows
      .filter((row) =>
        row.primaryMuscles.some((muscle) =>
          primaryMuscles.includes(muscle.muscleGroup),
        ),
      )
      .map((row) => this.toEntity(row));
  }

  async create(input: CreateExerciseInput): Promise<ExerciseEntity> {
    const created = await this.prismaService.exercise.create({
      data: {
        nameEs: input.nameEs,
        nameEn: input.nameEn,
        movementPattern: input.movementPattern,
        difficulty: input.difficulty,
        equipmentType: input.equipmentType,
        isCompound: input.isCompound,
        isCustom: true,
        createdByUserId: input.createdByUserId,
        primaryMuscles: {
          create: input.primaryMuscles.map((muscleGroup) => ({
            muscleGroup,
            secondaryForId: null,
          })),
        },
        secondaryMuscles: {
          create: input.secondaryMuscles.map((muscleGroup) => ({
            muscleGroup,
            primaryForId: null,
          })),
        },
      },
      include: {
        primaryMuscles: true,
        secondaryMuscles: true,
      },
    });

    return this.toEntity(created);
  }

  private toEntity(row: {
    id: string;
    nameEs: string;
    nameEn: string;
    movementPattern: string;
    difficulty: string;
    equipmentType: string;
    isCompound: boolean;
    createdAt: Date;
    updatedAt: Date;
    primaryMuscles: Array<{ muscleGroup: string }>;
    secondaryMuscles: Array<{ muscleGroup: string }>;
  }): ExerciseEntity {
    return new ExerciseEntity({
      id: row.id,
      nameEs: row.nameEs,
      nameEn: row.nameEn,
      movementPattern: row.movementPattern as MovementPattern,
      difficulty: row.difficulty as DifficultyLevel,
      equipmentType: row.equipmentType as EquipmentType,
      isCompound: row.isCompound,
      primaryMuscles: row.primaryMuscles.map(
        (muscle) => muscle.muscleGroup as MuscleGroup,
      ),
      secondaryMuscles: row.secondaryMuscles.map(
        (muscle) => muscle.muscleGroup as MuscleGroup,
      ),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
