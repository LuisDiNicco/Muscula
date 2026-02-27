import { ExerciseService } from '../../../src/application/services/exercise.service';
import type {
  CreateExerciseInput,
  IExerciseRepository,
} from '../../../src/application/interfaces/exercise-repository.interface';
import type { IEquipmentProfileRepository } from '../../../src/application/interfaces/equipment-profile-repository.interface';
import { ExerciseEntity } from '../../../src/domain/entities/exercise.entity';
import { EquipmentProfileEntity } from '../../../src/domain/entities/equipment-profile.entity';
import {
  DifficultyLevel,
  EquipmentType,
  MovementPattern,
  MuscleGroup,
} from '../../../src/domain/enums';
import { EntityNotFoundError } from '../../../src/domain/errors/entity-not-found.error';

describe('ExerciseService', () => {
  const now = new Date('2026-02-27T12:00:00.000Z');

  const buildExercise = (id = 'exercise-1'): ExerciseEntity =>
    new ExerciseEntity({
      id,
      nameEs: 'Press banca con barra (plano)',
      nameEn: 'Barbell Bench Press (Flat)',
      movementPattern: MovementPattern.HORIZONTAL_PUSH,
      difficulty: DifficultyLevel.INTERMEDIATE,
      equipmentType: EquipmentType.BARBELL,
      isCompound: true,
      primaryMuscles: [MuscleGroup.CHEST],
      secondaryMuscles: [MuscleGroup.TRICEPS],
      createdAt: now,
      updatedAt: now,
    });

  const buildProfile = (): EquipmentProfileEntity =>
    new EquipmentProfileEntity({
      id: 'profile-1',
      userId: 'user-1',
      name: 'Home',
      isActive: true,
      isPreset: false,
      equipment: [EquipmentType.BARBELL, EquipmentType.DUMBBELL],
      createdAt: now,
      updatedAt: now,
    });

  let exerciseRepository: jest.Mocked<IExerciseRepository>;
  let equipmentProfileRepository: jest.Mocked<IEquipmentProfileRepository>;
  let service: ExerciseService;

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

    service = new ExerciseService(
      exerciseRepository,
      equipmentProfileRepository,
    );
  });

  it('sanitizes page and limit when listing exercises', async () => {
    exerciseRepository.findAll.mockResolvedValue({
      data: [buildExercise()],
      total: 1,
    });

    const result = await service.listExercises({}, 0, 500);

    expect(exerciseRepository.findAll.mock.calls).toContainEqual([{}, 1, 100]);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(100);
    expect(result.total).toBe(1);
  });

  it('throws EntityNotFoundError when exercise does not exist', async () => {
    exerciseRepository.findById.mockResolvedValue(null);

    await expect(
      service.getExerciseDetail('missing-id'),
    ).rejects.toBeInstanceOf(EntityNotFoundError);
  });

  it('uses active user equipment to search substitutes', async () => {
    equipmentProfileRepository.findActiveByUser.mockResolvedValue(
      buildProfile(),
    );
    exerciseRepository.findSubstitutes.mockResolvedValue([
      buildExercise('sub-1'),
    ]);

    const result = await service.getSubstitutes('exercise-1', 'user-1');

    expect(exerciseRepository.findSubstitutes.mock.calls).toContainEqual([
      'exercise-1',
      [EquipmentType.BARBELL, EquipmentType.DUMBBELL],
    ]);
    expect(result).toHaveLength(1);
  });

  it('creates custom exercise with createdByUserId injected', async () => {
    const created = buildExercise('custom-1');
    exerciseRepository.create.mockResolvedValue(created);

    const input: Omit<CreateExerciseInput, 'createdByUserId'> = {
      nameEs: 'Remo unilateral',
      nameEn: 'Single Arm Row',
      movementPattern: MovementPattern.HORIZONTAL_PULL,
      difficulty: DifficultyLevel.BEGINNER,
      equipmentType: EquipmentType.DUMBBELL,
      isCompound: true,
      primaryMuscles: [MuscleGroup.BACK],
      secondaryMuscles: [MuscleGroup.BICEPS],
    };

    const result = await service.createCustomExercise('user-1', input);

    expect(exerciseRepository.create.mock.calls).toContainEqual([
      {
        ...input,
        createdByUserId: 'user-1',
      },
    ]);
    expect(result.id).toBe('custom-1');
  });
});
