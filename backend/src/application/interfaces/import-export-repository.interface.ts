export const IMPORT_EXPORT_REPOSITORY = 'IMPORT_EXPORT_REPOSITORY';

export type ExportSessionSetRow = {
  sessionId: string;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
  durationMinutes: number | null;
  exerciseName: string;
  setOrder: number;
  weightKg: number;
  reps: number;
  rir: number;
  completed: boolean;
  skipped: boolean;
};

export type ExportNutritionRow = {
  mealDate: Date;
  mealType: string;
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type ExportBodyMetricRow = {
  date: Date;
  weightKg: number | null;
  neckCm: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
};

export type ImportExerciseCandidate = {
  id: string;
  nameEs: string;
  nameEn: string;
};

export type ImportedSetInput = {
  setOrder: number;
  weightKg: number;
  reps: number;
};

export type ImportedExerciseInput = {
  exerciseOrder: number;
  exerciseId: string;
  sets: ImportedSetInput[];
};

export type ImportedSessionInput = {
  startedAt: Date;
  finishedAt: Date;
  exercises: ImportedExerciseInput[];
};

export interface IImportExportRepository {
  getSessionRows(userId: string): Promise<ExportSessionSetRow[]>;
  getNutritionRows(userId: string): Promise<ExportNutritionRow[]>;
  getBodyMetricRows(userId: string): Promise<ExportBodyMetricRow[]>;
  findExerciseCandidatesByNames(
    names: string[],
  ): Promise<ImportExerciseCandidate[]>;
  createCustomExercise(userId: string, name: string): Promise<string>;
  persistImportedSessions(
    userId: string,
    sessions: ImportedSessionInput[],
  ): Promise<number>;
}
