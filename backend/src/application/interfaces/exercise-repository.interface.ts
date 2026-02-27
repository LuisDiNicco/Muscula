import { ExerciseEntity } from '../../domain/entities/exercise.entity';
import {
  DifficultyLevel,
  EquipmentType,
  MovementPattern,
  MuscleGroup,
} from '../../domain/enums';

export const EXERCISE_REPOSITORY = 'EXERCISE_REPOSITORY';

export type ExerciseFilters = {
  movementPattern?: MovementPattern;
  difficulty?: DifficultyLevel;
  equipmentType?: EquipmentType;
  muscleGroup?: MuscleGroup;
  search?: string;
};

export type CreateExerciseInput = {
  nameEs: string;
  nameEn: string;
  movementPattern: MovementPattern;
  difficulty: DifficultyLevel;
  equipmentType: EquipmentType;
  isCompound: boolean;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  createdByUserId?: string;
};

export interface IExerciseRepository {
  findAll(
    filters: ExerciseFilters,
    page: number,
    limit: number,
  ): Promise<{ data: ExerciseEntity[]; total: number }>;
  findById(id: string): Promise<ExerciseEntity | null>;
  search(query: string, filters: ExerciseFilters): Promise<ExerciseEntity[]>;
  findSubstitutes(
    exerciseId: string,
    equipmentTypes: EquipmentType[],
  ): Promise<ExerciseEntity[]>;
  create(input: CreateExerciseInput): Promise<ExerciseEntity>;
}
