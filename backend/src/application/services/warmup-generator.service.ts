import { Injectable } from '@nestjs/common';

export type GeneratedWarmupSet = {
  setOrder: number;
  weightKg: number;
  reps: number;
  completed: boolean;
};

@Injectable()
export class WarmupGeneratorService {
  generateWarmup(workWeightKg: number, barWeightKg = 20): GeneratedWarmupSet[] {
    if (workWeightKg < 40) {
      return [];
    }

    const series: Array<{ weightKg: number; reps: number }> = [];

    series.push({ weightKg: barWeightKg, reps: 10 });

    const weight50 = this.roundToIncrement(workWeightKg * 0.5, 2.5);
    if (weight50 > barWeightKg) {
      series.push({ weightKg: weight50, reps: 5 });
    }

    const weight70 = this.roundToIncrement(workWeightKg * 0.7, 2.5);
    if (weight70 > weight50) {
      series.push({ weightKg: weight70, reps: 3 });
    }

    if (workWeightKg >= 80) {
      const weight85 = this.roundToIncrement(workWeightKg * 0.85, 2.5);
      if (weight85 > weight70) {
        series.push({ weightKg: weight85, reps: 1 });
      }
    }

    return series.map((set, index) => ({
      setOrder: index + 1,
      weightKg: set.weightKg,
      reps: set.reps,
      completed: false,
    }));
  }

  private roundToIncrement(value: number, increment: number): number {
    return Math.round(value / increment) * increment;
  }
}
