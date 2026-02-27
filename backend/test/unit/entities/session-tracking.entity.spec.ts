import { ReadinessScoreEntity } from '../../../src/domain/entities/readiness-score.entity';
import { SessionEntity } from '../../../src/domain/entities/session.entity';
import { WorkingSetEntity } from '../../../src/domain/entities/working-set.entity';
import { SessionStatus } from '../../../src/domain/enums';

describe('SessionEntity', () => {
  const baseDate = new Date('2026-02-27T10:00:00.000Z');

  const buildSession = (): SessionEntity =>
    new SessionEntity({
      id: 'session-1',
      userId: 'user-1',
      mesocycleId: 'meso-1',
      trainingDayId: 'day-1',
      weekNumber: 1,
      status: SessionStatus.IN_PROGRESS,
      startedAt: baseDate,
      finishedAt: null,
      durationMinutes: null,
      sessionNotes: null,
      deletedAt: null,
      createdAt: baseDate,
      updatedAt: baseDate,
    });

  it('returns true when session is in progress', () => {
    expect(buildSession().isInProgress()).toBe(true);
  });

  it('calculates duration in minutes', () => {
    const session = buildSession();
    const duration = session.getDuration(new Date('2026-02-27T11:15:00.000Z'));

    expect(duration).toBe(75);
  });

  it('completes an in-progress session', () => {
    const session = buildSession();

    session.complete('  Buena sesión  ');

    expect(session.status).toBe(SessionStatus.COMPLETED);
    expect(session.finishedAt).not.toBeNull();
    expect(session.durationMinutes).not.toBeNull();
    expect(session.sessionNotes).toBe('Buena sesión');
  });
});

describe('WorkingSetEntity', () => {
  const now = new Date('2026-02-27T10:00:00.000Z');

  const buildSet = (rir: number, completed = true): WorkingSetEntity =>
    new WorkingSetEntity({
      id: 'set-1',
      sessionExerciseId: 'session-ex-1',
      setOrder: 1,
      weightKg: 100,
      reps: 5,
      rir,
      restTimeSec: 120,
      notes: null,
      completed,
      skipped: false,
      createdAt: now,
      updatedAt: now,
    });

  it('is effective for RIR 0 to 4 when completed', () => {
    expect(buildSet(0).isEffective()).toBe(true);
    expect(buildSet(4).isEffective()).toBe(true);
  });

  it('is not effective for RIR 5+', () => {
    expect(buildSet(5).isEffective()).toBe(false);
  });

  it('estimates 1RM using Epley + Brzycki average', () => {
    const estimated = buildSet(2).getEstimated1RM();

    expect(estimated).toBe(114.5);
  });
});

describe('ReadinessScoreEntity', () => {
  const now = new Date('2026-02-27T10:00:00.000Z');

  it('calculates weighted total score and adjustment factor', () => {
    const readiness = new ReadinessScoreEntity({
      id: 'readiness-1',
      userId: 'user-1',
      sessionId: 'session-1',
      sleepScore: 2,
      stressScore: 3,
      domsScore: 4,
      totalScore: 0,
      createdAt: now,
    });

    const total = readiness.calculateTotal();

    expect(total).toBe(2.9);
    expect(readiness.getAdjustmentFactor()).toBe(1);
  });

  it('returns lower adjustment factor for low readiness', () => {
    const readiness = new ReadinessScoreEntity({
      id: 'readiness-2',
      userId: 'user-1',
      sessionId: 'session-1',
      sleepScore: 1,
      stressScore: 2,
      domsScore: 2,
      totalScore: 0,
      createdAt: now,
    });

    readiness.calculateTotal();

    expect(readiness.getAdjustmentFactor()).toBe(0.95);
  });
});
