import { Inject, Injectable } from '@nestjs/common';
import {
  CreateExerciseInput,
  EXERCISE_REPOSITORY,
  ExerciseFilters,
  type IExerciseRepository,
} from '../interfaces/exercise-repository.interface';
import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import { ExerciseEntity } from '../../domain/entities/exercise.entity';
import {
  EQUIPMENT_PROFILE_REPOSITORY,
  type IEquipmentProfileRepository,
} from '../interfaces/equipment-profile-repository.interface';

@Injectable()
export class ExerciseService {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exerciseRepository: IExerciseRepository,
    @Inject(EQUIPMENT_PROFILE_REPOSITORY)
    private readonly equipmentProfileRepository: IEquipmentProfileRepository,
  ) {}

  async listExercises(
    filters: ExerciseFilters,
    page: number,
    limit: number,
  ): Promise<{
    data: ExerciseEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const sanitizedPage = page > 0 ? page : 1;
    const sanitizedLimit = limit > 0 ? Math.min(limit, 100) : 20;

    const { data, total } = await this.exerciseRepository.findAll(
      filters,
      sanitizedPage,
      sanitizedLimit,
    );

    return {
      data,
      total,
      page: sanitizedPage,
      limit: sanitizedLimit,
    };
  }

  async getExerciseDetail(id: string): Promise<ExerciseEntity> {
    const exercise = await this.exerciseRepository.findById(id);
    if (exercise === null) {
      throw new EntityNotFoundError('Exercise', id);
    }

    return exercise;
  }

  async getSubstitutes(
    exerciseId: string,
    userId: string,
  ): Promise<ExerciseEntity[]> {
    const activeProfile =
      await this.equipmentProfileRepository.findActiveByUser(userId);

    const equipment = activeProfile?.equipment ?? [];
    const substitutes = await this.exerciseRepository.findSubstitutes(
      exerciseId,
      equipment,
    );

    return substitutes;
  }

  async createCustomExercise(
    userId: string,
    input: Omit<CreateExerciseInput, 'createdByUserId'>,
  ): Promise<ExerciseEntity> {
    return this.exerciseRepository.create({
      ...input,
      createdByUserId: userId,
    });
  }
}
