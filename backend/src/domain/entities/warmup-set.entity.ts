export type WarmupSetEntityProps = {
  id: string;
  sessionExerciseId: string;
  setOrder: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  createdAt: Date;
};

export class WarmupSetEntity {
  constructor(private readonly props: WarmupSetEntityProps) {}

  get id(): string {
    return this.props.id;
  }

  get sessionExerciseId(): string {
    return this.props.sessionExerciseId;
  }

  get setOrder(): number {
    return this.props.setOrder;
  }

  get weightKg(): number {
    return this.props.weightKg;
  }

  get reps(): number {
    return this.props.reps;
  }

  get completed(): boolean {
    return this.props.completed;
  }
}
