import { WarmupGeneratorService } from '../../../src/application/services/warmup-generator.service';

describe('WarmupGeneratorService', () => {
  let service: WarmupGeneratorService;

  beforeEach(() => {
    service = new WarmupGeneratorService();
  });

  it('returns empty warmup for very light loads (< 40kg)', () => {
    expect(service.generateWarmup(35)).toEqual([]);
  });

  it('returns 3 warmup sets for standard loads', () => {
    const result = service.generateWarmup(60);

    expect(result).toEqual([
      { setOrder: 1, weightKg: 20, reps: 10, completed: false },
      { setOrder: 2, weightKg: 30, reps: 5, completed: false },
      { setOrder: 3, weightKg: 42.5, reps: 3, completed: false },
    ]);
  });

  it('returns 4 warmup sets for heavy loads (>= 80kg)', () => {
    const result = service.generateWarmup(100);

    expect(result).toEqual([
      { setOrder: 1, weightKg: 20, reps: 10, completed: false },
      { setOrder: 2, weightKg: 50, reps: 5, completed: false },
      { setOrder: 3, weightKg: 70, reps: 3, completed: false },
      { setOrder: 4, weightKg: 85, reps: 1, completed: false },
    ]);
  });

  it('handles edge case when 50% equals bar weight', () => {
    const result = service.generateWarmup(40, 20);

    expect(result).toEqual([
      { setOrder: 1, weightKg: 20, reps: 10, completed: false },
      { setOrder: 2, weightKg: 27.5, reps: 3, completed: false },
    ]);
  });
});
