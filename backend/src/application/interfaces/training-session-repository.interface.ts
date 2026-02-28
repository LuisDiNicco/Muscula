import { SessionEntity } from '../../domain/entities/session.entity';
import { SessionStatus } from '../../domain/enums';

export const TRAINING_SESSION_REPOSITORY = 'TRAINING_SESSION_REPOSITORY';

export type SessionListFilters = {
  status?: SessionStatus;
};

export type StartSessionInput = {
  userId: string;
  mesocycleId?: string;
  trainingDayId?: string;
  weekNumber?: number;
};

export type AddExerciseInput = {
  exerciseId: string;
  order: number;
};

export type AddSetInput = {
  weightKg: number;
  reps: number;
  rir: number;
  restTimeSec?: number;
  notes?: string;
  completed: boolean;
  skipped: boolean;
};

export type UpdateSetInput = Partial<AddSetInput>;

export type SessionExerciseDetail = {
  id: string;
  exerciseId: string;
  exerciseOrder: number;
  originalExerciseId: string | null;
  sets: Array<{
    id: string;
    setOrder: number;
    weightKg: number;
    reps: number;
    rir: number;
    restTimeSec: number | null;
    notes: string | null;
    completed: boolean;
    skipped: boolean;
  }>;
  warmups: Array<{
    id: string;
    setOrder: number;
    weightKg: number;
    reps: number;
    completed: boolean;
  }>;
};

export type SessionDetail = {
  session: SessionEntity;
  readiness: {
    sleepScore: number;
    stressScore: number;
    domsScore: number;
    totalScore: number;
  } | null;
  exercises: SessionExerciseDetail[];
};

export interface ITrainingSessionRepository {
  create(input: StartSessionInput): Promise<SessionEntity>;
  findById(userId: string, sessionId: string): Promise<SessionEntity | null>;
  findActiveByUser(userId: string): Promise<SessionEntity | null>;
  findDetailById(
    userId: string,
    sessionId: string,
  ): Promise<SessionDetail | null>;
  listByUser(
    userId: string,
    filters: SessionListFilters,
    page: number,
    limit: number,
  ): Promise<{ data: SessionEntity[]; total: number }>;
  addExercise(
    userId: string,
    sessionId: string,
    input: AddExerciseInput,
  ): Promise<void>;
  removeExercise(
    userId: string,
    sessionId: string,
    exerciseId: string,
  ): Promise<void>;
  substituteExercise(
    userId: string,
    sessionId: string,
    oldExerciseId: string,
    newExerciseId: string,
  ): Promise<void>;
  addSet(
    userId: string,
    sessionId: string,
    exerciseId: string,
    input: AddSetInput,
  ): Promise<void>;
  updateSet(
    userId: string,
    sessionId: string,
    setId: string,
    input: UpdateSetInput,
  ): Promise<void>;
  deleteSet(userId: string, sessionId: string, setId: string): Promise<void>;
  completeSession(
    userId: string,
    sessionId: string,
    notes?: string,
  ): Promise<void>;
  abandonSession(userId: string, sessionId: string): Promise<void>;
  upsertReadiness(
    userId: string,
    sessionId: string,
    sleepScore: number,
    stressScore: number,
    domsScore: number,
    totalScore: number,
  ): Promise<void>;
}
