import {
  buildExerciseCatalog,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_VOLUME_LANDMARKS,
} from '../../../prisma/seed';

describe('Seed data', () => {
  it('provides at least 150 exercises including required baseline entries', () => {
    const exercises = buildExerciseCatalog();
    const names = new Set(exercises.map((exercise) => exercise.nameEs));

    expect(exercises.length).toBeGreaterThanOrEqual(150);
    expect(names.has('Press banca con barra (plano)')).toBe(true);
    expect(names.has('Dominadas (agarre prono)')).toBe(true);
    expect(names.has('Plancha')).toBe(true);
  });

  it('provides at least 10 achievements', () => {
    expect(DEFAULT_ACHIEVEMENTS.length).toBeGreaterThanOrEqual(10);
  });

  it('defines default landmarks for all seedable muscle groups', () => {
    expect(DEFAULT_VOLUME_LANDMARKS.length).toBe(12);
  });
});
