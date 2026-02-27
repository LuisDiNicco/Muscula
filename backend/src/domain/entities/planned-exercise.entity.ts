import { ValidationError } from '../errors/validation.error';

export type PlannedExerciseEntityProps = {
  id: string;
  trainingDayId: string;
  exerciseId: string;
  exerciseOrder: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  targetRir: number;
  tempo: string | null;
  supersetGroup: number | null;
  setupNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class PlannedExerciseEntity {
  constructor(private readonly props: PlannedExerciseEntityProps) {
    this.assertBusinessRules();
  }

  get id(): string {
    return this.props.id;
  }

  get trainingDayId(): string {
    return this.props.trainingDayId;
  }

  get exerciseId(): string {
    return this.props.exerciseId;
  }

  get exerciseOrder(): number {
    return this.props.exerciseOrder;
  }

  get targetSets(): number {
    return this.props.targetSets;
  }

  get targetRepsMin(): number {
    return this.props.targetRepsMin;
  }

  get targetRepsMax(): number {
    return this.props.targetRepsMax;
  }

  get targetRir(): number {
    return this.props.targetRir;
  }

  get tempo(): string | null {
    return this.props.tempo;
  }

  get supersetGroup(): number | null {
    return this.props.supersetGroup;
  }

  get setupNotes(): string | null {
    return this.props.setupNotes;
  }

  private assertBusinessRules(): void {
    if (this.props.targetSets <= 0) {
      throw new ValidationError('targetSets must be greater than 0');
    }

    if (this.props.targetRepsMin > this.props.targetRepsMax) {
      throw new ValidationError(
        'targetRepsMin must be less or equal to targetRepsMax',
      );
    }

    if (this.props.targetRir < 0 || this.props.targetRir > 5) {
      throw new ValidationError('targetRir must be between 0 and 5');
    }
  }
}
