import { ExerciseSubstitutionService } from '../../../src/application/services/exercise-substitution.service';
import type { IEquipmentProfileRepository } from '../../../src/application/interfaces/equipment-profile-repository.interface';
import type { IExerciseRepository } from '../../../src/application/interfaces/exercise-repository.interface';
import type { ITrainingSessionRepository } from '../../../src/application/interfaces/training-session-repository.interface';
import { EquipmentProfileEntity } from '../../../src/domain/entities/equipment-profile.entity';
import { ExerciseEntity } from '../../../src/domain/entities/exercise.entity';
import {
  DifficultyLevel,
  EquipmentType,
  MovementPattern,
  MuscleGroup,
} from '../../../src/domain/enums';
import { EntityNotFoundError } from '../../../src/domain/errors/entity-not-found.error';
import { ValidationError } from '../../../src/domain/errors/validation.error';

describe('ExerciseSubstitutionService', () => {
  let exerciseRepository: jest.Mocked<IExerciseRepository>;
  let equipmentProfileRepository: jest.Mocked<IEquipmentProfileRepository>;
  let sessionRepository: jest.Mocked<ITrainingSessionRepository>;
  let service: ExerciseSubstitutionService;

  const now = new Date('2026-02-28T10:00:00.000Z');

  const buildExercise = (id: string): ExerciseEntity =>
    new ExerciseEntity({
      id,
      nameEs: 'Press Banca',
      nameEn: 'Bench Press',
      movementPattern: MovementPattern.HORIZONTAL_PUSH,
      difficulty: DifficultyLevel.INTERMEDIATE,
      equipmentType: EquipmentType.BARBELL,
      isCompound: true,
      primaryMuscles: [MuscleGroup.CHEST],
      secondaryMuscles: [MuscleGroup.TRICEPS],
      createdAt: now,
      updatedAt: now,
    });

  const buildEquipmentProfile = (): EquipmentProfileEntity =>
    new EquipmentProfileEntity({
      id: 'profile-1',
      userId: 'user-1',
      name: 'Gym',
      equipment: [EquipmentType.BARBELL, EquipmentType.BENCH],
      isActive: true,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });

  beforeEach(() => {
    exerciseRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      search: jest.fn(),
      findSubstitutes: jest.fn(),
      create: jest.fn(),
    };

    equipmentProfileRepository = {
      findAllByUser: jest.fn(),
      findActiveByUser: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      setActive: jest.fn(),
    };

    sessionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findActiveByUser: jest.fn(),
      findDetailById: jest.fn(),
      listByUser: jest.fn(),
      addExercise: jest.fn(),
      removeExercise: jest.fn(),
      substituteExercise: jest.fn(),
      addSet: jest.fn(),
      updateSet: jest.fn(),
      deleteSet: jest.fn(),
      completeSession: jest.fn(),
      abandonSession: jest.fn(),
      upsertReadiness: jest.fn(),
    };

    service = new ExerciseSubstitutionService(
      exerciseRepository,
      equipmentProfileRepository,
      sessionRepository,
    );
  });

  it('throws not found when base exercise does not exist', async () => {
    exerciseRepository.findById.mockResolvedValue(null);

    await expect(service.findSubstitutes('missing', 'user-1')).rejects.toThrow(
      EntityNotFoundError,
    );
  });

  it('returns filtered substitutes using active equipment profile', async () => {
    exerciseRepository.findById.mockResolvedValue(buildExercise('exercise-1'));
    equipmentProfileRepository.findActiveByUser.mockResolvedValue(
      buildEquipmentProfile(),
    );
    exerciseRepository.findSubstitutes.mockResolvedValue([
      buildExercise('exercise-2'),
    ]);

    const result = await service.findSubstitutes('exercise-1', 'user-1');

    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe('exercise-2');
    expect(exerciseRepository.findSubstitutes.mock.calls[0]).toEqual([
      'exercise-1',
      [EquipmentType.BARBELL, EquipmentType.BENCH],
    ]);
  });

  it('rejects substitution when replacement equals original', async () => {
    await expect(
      service.substituteExercise(
        'user-1',
        'session-1',
        'exercise-1',
        'exercise-1',
      ),
    ).rejects.toThrow(ValidationError);
  });

  it('rejects substitution when replacement is invalid for substitution rules', async () => {
    exerciseRepository.findById.mockResolvedValue(buildExercise('exercise-3'));
    exerciseRepository.findSubstitutes.mockResolvedValue([
      buildExercise('exercise-2'),
    ]);
    equipmentProfileRepository.findActiveByUser.mockResolvedValue(
      buildEquipmentProfile(),
    );

    await expect(
      service.substituteExercise(
        'user-1',
        'session-1',
        'exercise-1',
        'exercise-3',
      ),
    ).rejects.toThrow(ValidationError);
  });

  it('performs substitution when replacement is valid', async () => {
    exerciseRepository.findById.mockResolvedValue(buildExercise('exercise-2'));
    exerciseRepository.findSubstitutes.mockResolvedValue([
      buildExercise('exercise-2'),
    ]);
    equipmentProfileRepository.findActiveByUser.mockResolvedValue(
      buildEquipmentProfile(),
    );

    await service.substituteExercise(
      'user-1',
      'session-1',
      'exercise-1',
      'exercise-2',
    );

    expect(sessionRepository.substituteExercise.mock.calls[0]).toEqual([
      'user-1',
      'session-1',
      'exercise-1',
      'exercise-2',
    ]);
  });
});
