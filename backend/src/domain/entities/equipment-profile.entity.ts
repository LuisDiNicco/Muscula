import { EquipmentType } from '../enums';
import { ExerciseEntity } from './exercise.entity';

export type EquipmentProfileEntityProps = {
  id: string;
  userId: string;
  name: string;
  isActive: boolean;
  isPreset: boolean;
  equipment: EquipmentType[];
  createdAt: Date;
  updatedAt: Date;
};

export class EquipmentProfileEntity {
  constructor(private readonly props: EquipmentProfileEntityProps) {}

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get name(): string {
    return this.props.name;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get isPreset(): boolean {
    return this.props.isPreset;
  }

  get equipment(): EquipmentType[] {
    return this.props.equipment;
  }

  hasEquipment(type: EquipmentType): boolean {
    return this.props.equipment.includes(type);
  }

  filterExercises(exercises: ExerciseEntity[]): ExerciseEntity[] {
    return exercises.filter((exercise) =>
      this.hasEquipment(exercise.equipmentType),
    );
  }
}
