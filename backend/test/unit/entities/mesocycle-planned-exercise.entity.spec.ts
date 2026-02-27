import { MesocycleEntity } from '../../../src/domain/entities/mesocycle.entity';
import { PlannedExerciseEntity } from '../../../src/domain/entities/planned-exercise.entity';
import { TrainingDayEntity } from '../../../src/domain/entities/training-day.entity';
import { MesocycleStatus, TrainingObjective } from '../../../src/domain/enums';
import { ValidationError } from '../../../src/domain/errors/validation.error';

describe('MesocycleEntity', () => {
  const now = new Date('2026-02-27T12:00:00.000Z');

  const buildPlannedExercise = (): PlannedExerciseEntity =>
    new PlannedExerciseEntity({
      id: 'planned-1',
      trainingDayId: 'day-1',
      exerciseId: 'exercise-1',
      exerciseOrder: 1,
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 10,
      targetRir: 2,
      tempo: null,
      supersetGroup: null,
      setupNotes: null,
      createdAt: now,
      updatedAt: now,
    });

  const buildTrainingDay = (): TrainingDayEntity =>
    new TrainingDayEntity({
      id: 'day-1',
      mesocycleId: 'meso-1',
      name: 'Upper A',
      dayOrder: 1,
      plannedExercises: [buildPlannedExercise()],
      createdAt: now,
      updatedAt: now,
    });

  const buildMesocycle = (
    status: MesocycleStatus,
    deletedAt: Date | null = null,
  ): MesocycleEntity =>
    new MesocycleEntity({
      id: 'meso-1',
      userId: 'user-1',
      name: 'Hipertrofia base',
      description: null,
      durationWeeks: 8,
      objective: TrainingObjective.HYPERTROPHY,
      includeDeload: true,
      status,
      startedAt: null,
      completedAt: null,
      deletedAt,
      trainingDays: [buildTrainingDay()],
      createdAt: now,
      updatedAt: now,
    });

  it('canActivate is true only for DRAFT mesocycles not deleted', () => {
    expect(buildMesocycle(MesocycleStatus.DRAFT).canActivate()).toBe(true);
    expect(buildMesocycle(MesocycleStatus.ACTIVE).canActivate()).toBe(false);
    expect(buildMesocycle(MesocycleStatus.COMPLETED).canActivate()).toBe(false);
    expect(
      buildMesocycle(
        MesocycleStatus.DRAFT,
        new Date('2026-02-28T00:00:00.000Z'),
      ).canActivate(),
    ).toBe(false);
  });

  it('canComplete is true only for ACTIVE mesocycles not deleted', () => {
    expect(buildMesocycle(MesocycleStatus.ACTIVE).canComplete()).toBe(true);
    expect(buildMesocycle(MesocycleStatus.DRAFT).canComplete()).toBe(false);
    expect(buildMesocycle(MesocycleStatus.ARCHIVED).canComplete()).toBe(false);
    expect(
      buildMesocycle(
        MesocycleStatus.ACTIVE,
        new Date('2026-02-28T00:00:00.000Z'),
      ).canComplete(),
    ).toBe(false);
  });
});

describe('PlannedExerciseEntity', () => {
  const now = new Date('2026-02-27T12:00:00.000Z');

  const buildProps = () => ({
    id: 'planned-1',
    trainingDayId: 'day-1',
    exerciseId: 'exercise-1',
    exerciseOrder: 1,
    targetSets: 3,
    targetRepsMin: 8,
    targetRepsMax: 10,
    targetRir: 2,
    tempo: null,
    supersetGroup: null,
    setupNotes: null,
    createdAt: now,
    updatedAt: now,
  });

  it('creates planned exercise when business rules are valid', () => {
    const plannedExercise = new PlannedExerciseEntity(buildProps());

    expect(plannedExercise.targetSets).toBe(3);
    expect(plannedExercise.targetRepsMin).toBeLessThanOrEqual(
      plannedExercise.targetRepsMax,
    );
    expect(plannedExercise.targetRir).toBeGreaterThanOrEqual(0);
    expect(plannedExercise.targetRir).toBeLessThanOrEqual(5);
  });

  it('throws ValidationError when targetSets is invalid', () => {
    expect(
      () =>
        new PlannedExerciseEntity({
          ...buildProps(),
          targetSets: 0,
        }),
    ).toThrow(ValidationError);
  });

  it('throws ValidationError when targetRepsMin is greater than targetRepsMax', () => {
    expect(
      () =>
        new PlannedExerciseEntity({
          ...buildProps(),
          targetRepsMin: 12,
          targetRepsMax: 8,
        }),
    ).toThrow(ValidationError);
  });

  it('throws ValidationError when targetRir is out of range', () => {
    expect(
      () =>
        new PlannedExerciseEntity({
          ...buildProps(),
          targetRir: 6,
        }),
    ).toThrow(ValidationError);
  });
});
