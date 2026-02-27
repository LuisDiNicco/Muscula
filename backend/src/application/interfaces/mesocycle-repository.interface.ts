import { MesocycleStatus, TrainingObjective } from '../../domain/enums';
import { MesocycleEntity } from '../../domain/entities/mesocycle.entity';

export const MESOCYCLE_REPOSITORY = 'MESOCYCLE_REPOSITORY';

export type MesocycleFilters = {
  status?: MesocycleStatus;
  objective?: TrainingObjective;
  search?: string;
};

export type CreatePlannedExerciseInput = {
  exerciseId: string;
  exerciseOrder: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRir: number;
  tempo?: string;
  supersetGroup?: number;
  setupNotes?: string;
};

export type CreateTrainingDayInput = {
  name: string;
  dayOrder: number;
  plannedExercises: CreatePlannedExerciseInput[];
};

export type CreateMesocycleInput = {
  userId: string;
  name: string;
  description?: string;
  durationWeeks: number;
  objective: TrainingObjective;
  includeDeload: boolean;
  trainingDays: CreateTrainingDayInput[];
};

export type UpdateMesocycleInput = Omit<CreateMesocycleInput, 'userId'>;

export interface IMesocycleRepository {
  findAllByUser(
    userId: string,
    filters: MesocycleFilters,
    page: number,
    limit: number,
  ): Promise<{ data: MesocycleEntity[]; total: number }>;
  findById(userId: string, id: string): Promise<MesocycleEntity | null>;
  findActiveByUser(userId: string): Promise<MesocycleEntity | null>;
  create(input: CreateMesocycleInput): Promise<MesocycleEntity>;
  update(
    userId: string,
    id: string,
    input: UpdateMesocycleInput,
  ): Promise<MesocycleEntity>;
  softDelete(userId: string, id: string): Promise<void>;
  duplicate(userId: string, id: string): Promise<MesocycleEntity>;
  activate(userId: string, id: string): Promise<void>;
  complete(userId: string, id: string): Promise<void>;
}
