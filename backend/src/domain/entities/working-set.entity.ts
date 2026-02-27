export type WorkingSetEntityProps = {
  id: string;
  sessionExerciseId: string;
  setOrder: number;
  weightKg: number;
  reps: number;
  rir: number;
  restTimeSec: number | null;
  notes: string | null;
  completed: boolean;
  skipped: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class WorkingSetEntity {
  constructor(private readonly props: WorkingSetEntityProps) {}

  get rir(): number {
    return this.props.rir;
  }

  get reps(): number {
    return this.props.reps;
  }

  get weightKg(): number {
    return this.props.weightKg;
  }

  get completed(): boolean {
    return this.props.completed;
  }

  get skipped(): boolean {
    return this.props.skipped;
  }

  isEffective(): boolean {
    return this.props.completed && !this.props.skipped && this.props.rir <= 4;
  }

  getEstimated1RM(): number | null {
    if (this.props.reps <= 0 || this.props.reps > 10) {
      return null;
    }

    if (this.props.reps === 1) {
      return this.props.weightKg;
    }

    const epley = this.props.weightKg * (1 + this.props.reps / 30);
    const brzycki = this.props.weightKg * (36 / (37 - this.props.reps));

    return this.roundToIncrement((epley + brzycki) / 2, 0.5);
  }

  private roundToIncrement(value: number, increment: number): number {
    return Math.round(value / increment) * increment;
  }
}
