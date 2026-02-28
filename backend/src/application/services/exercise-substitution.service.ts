import { Inject, Injectable } from '@nestjs/common';
import {
  EQUIPMENT_PROFILE_REPOSITORY,
  type IEquipmentProfileRepository,
} from '../interfaces/equipment-profile-repository.interface';
import {
  EXERCISE_REPOSITORY,
  type IExerciseRepository,
} from '../interfaces/exercise-repository.interface';
import {
  TRAINING_SESSION_REPOSITORY,
  type ITrainingSessionRepository,
} from '../interfaces/training-session-repository.interface';
import { ExerciseEntity } from '../../domain/entities/exercise.entity';
import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import { ValidationError } from '../../domain/errors/validation.error';

@Injectable()
export class ExerciseSubstitutionService {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exerciseRepository: IExerciseRepository,
    @Inject(EQUIPMENT_PROFILE_REPOSITORY)
    private readonly equipmentProfileRepository: IEquipmentProfileRepository,
    @Inject(TRAINING_SESSION_REPOSITORY)
    private readonly sessionRepository: ITrainingSessionRepository,
  ) {}

  async findSubstitutes(
    exerciseId: string,
    userId: string,
  ): Promise<ExerciseEntity[]> {
    const baseExercise = await this.exerciseRepository.findById(exerciseId);
    if (baseExercise === null) {
      throw new EntityNotFoundError('Exercise', exerciseId);
    }

    const activeProfile =
      await this.equipmentProfileRepository.findActiveByUser(userId);
    const availableEquipment = activeProfile?.equipment ?? [];

    return this.exerciseRepository.findSubstitutes(
      exerciseId,
      availableEquipment,
    );
  }

  async substituteExercise(
    userId: string,
    sessionId: string,
    oldExerciseId: string,
    newExerciseId: string,
  ): Promise<void> {
    if (oldExerciseId === newExerciseId) {
      throw new ValidationError(
        'Replacement exercise must be different from the original one',
      );
    }

    const replacementExercise =
      await this.exerciseRepository.findById(newExerciseId);
    if (replacementExercise === null) {
      throw new EntityNotFoundError('Exercise', newExerciseId);
    }

    const substitutes = await this.findSubstitutes(oldExerciseId, userId);
    const isValidReplacement = substitutes.some(
      (exercise) => exercise.id === replacementExercise.id,
    );

    if (!isValidReplacement) {
      throw new ValidationError(
        'Replacement exercise must match movement pattern and primary muscle with available equipment',
      );
    }

    await this.sessionRepository.substituteExercise(
      userId,
      sessionId,
      oldExerciseId,
      newExerciseId,
    );
  }
}
