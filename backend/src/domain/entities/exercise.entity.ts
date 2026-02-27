import {
  DifficultyLevel,
  EquipmentType,
  MovementPattern,
  MuscleGroup,
} from '../enums';

export type ExerciseEntityProps = {
  id: string;
  nameEs: string;
  nameEn: string;
  movementPattern: MovementPattern;
  difficulty: DifficultyLevel;
  equipmentType: EquipmentType;
  isCompound: boolean;
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  createdAt: Date;
  updatedAt: Date;
};

export class ExerciseEntity {
  constructor(private readonly props: ExerciseEntityProps) {}

  get id(): string {
    return this.props.id;
  }

  get nameEs(): string {
    return this.props.nameEs;
  }

  get nameEn(): string {
    return this.props.nameEn;
  }

  get movementPattern(): MovementPattern {
    return this.props.movementPattern;
  }

  get difficulty(): DifficultyLevel {
    return this.props.difficulty;
  }

  get equipmentType(): EquipmentType {
    return this.props.equipmentType;
  }

  get isCompound(): boolean {
    return this.props.isCompound;
  }

  get primaryMuscles(): MuscleGroup[] {
    return this.props.primaryMuscles;
  }

  get secondaryMuscles(): MuscleGroup[] {
    return this.props.secondaryMuscles;
  }

  matchesPattern(pattern: MovementPattern): boolean {
    return this.props.movementPattern === pattern;
  }

  matchesMuscle(muscle: MuscleGroup): boolean {
    return (
      this.props.primaryMuscles.includes(muscle) ||
      this.props.secondaryMuscles.includes(muscle)
    );
  }
}
