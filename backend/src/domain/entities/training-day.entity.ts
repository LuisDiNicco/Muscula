import { PlannedExerciseEntity } from './planned-exercise.entity';

export type TrainingDayEntityProps = {
  id: string;
  mesocycleId: string;
  name: string;
  dayOrder: number;
  plannedExercises: PlannedExerciseEntity[];
  createdAt: Date;
  updatedAt: Date;
};

export class TrainingDayEntity {
  constructor(private readonly props: TrainingDayEntityProps) {}

  get id(): string {
    return this.props.id;
  }

  get mesocycleId(): string {
    return this.props.mesocycleId;
  }

  get name(): string {
    return this.props.name;
  }

  get dayOrder(): number {
    return this.props.dayOrder;
  }

  get plannedExercises(): PlannedExerciseEntity[] {
    return this.props.plannedExercises;
  }

  getExercisesInOrder(): PlannedExerciseEntity[] {
    return [...this.props.plannedExercises].sort(
      (left, right) => left.exerciseOrder - right.exerciseOrder,
    );
  }

  hasSupersets(): boolean {
    return this.props.plannedExercises.some(
      (exercise) => exercise.supersetGroup !== null,
    );
  }
}
