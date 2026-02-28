import { TrainingObjective } from '../../domain/enums';

export const ROUTINE_SHARING_REPOSITORY = 'ROUTINE_SHARING_REPOSITORY';

export type SharedRoutineSummary = {
  code: string;
  expiresAt: Date;
};

export type SharedRoutinePreview = {
  code: string;
  expiresAt: Date;
  viewCount: number;
  mesocycle: {
    id: string;
    name: string;
    description: string | null;
    durationWeeks: number;
    objective: TrainingObjective;
    includeDeload: boolean;
    trainingDays: Array<{
      name: string;
      dayOrder: number;
      plannedExercises: Array<{
        exerciseId: string;
        exerciseOrder: number;
        targetSets: number;
        targetRepsMin: number;
        targetRepsMax: number;
        targetRir: number;
      }>;
    }>;
  };
};

export type ImportedRoutineResult = {
  mesocycleId: string;
  name: string;
};

export interface IRoutineSharingRepository {
  codeExists(code: string): Promise<boolean>;
  createShare(
    userId: string,
    mesocycleId: string,
    code: string,
    expiresAt: Date,
  ): Promise<SharedRoutineSummary>;
  getPreviewByCode(code: string): Promise<SharedRoutinePreview | null>;
  incrementViewCount(code: string): Promise<void>;
  importByCode(userId: string, code: string): Promise<ImportedRoutineResult>;
}
