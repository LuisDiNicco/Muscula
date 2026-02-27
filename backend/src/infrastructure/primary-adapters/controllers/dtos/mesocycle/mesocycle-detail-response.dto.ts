import { ApiProperty } from '@nestjs/swagger';
import { MesocycleEntity } from '../../../../../domain/entities/mesocycle.entity';

class PlannedExerciseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  exerciseId!: string;

  @ApiProperty()
  exerciseOrder!: number;

  @ApiProperty()
  targetSets!: number;

  @ApiProperty()
  targetRepsMin!: number;

  @ApiProperty()
  targetRepsMax!: number;

  @ApiProperty()
  targetRir!: number;

  @ApiProperty({ nullable: true })
  tempo!: string | null;

  @ApiProperty({ nullable: true })
  supersetGroup!: number | null;

  @ApiProperty({ nullable: true })
  setupNotes!: string | null;
}

class TrainingDayResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  dayOrder!: number;

  @ApiProperty({ type: () => [PlannedExerciseResponseDto] })
  plannedExercises!: PlannedExerciseResponseDto[];
}

export class MesocycleDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  durationWeeks!: number;

  @ApiProperty()
  objective!: string;

  @ApiProperty()
  includeDeload!: boolean;

  @ApiProperty()
  status!: string;

  @ApiProperty({ nullable: true })
  startedAt!: Date | null;

  @ApiProperty({ nullable: true })
  completedAt!: Date | null;

  @ApiProperty({ type: () => [TrainingDayResponseDto] })
  trainingDays!: TrainingDayResponseDto[];

  static fromEntity(entity: MesocycleEntity): MesocycleDetailResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      description: entity.description,
      durationWeeks: entity.durationWeeks,
      objective: entity.objective,
      includeDeload: entity.includeDeload,
      status: entity.status,
      startedAt: entity.startedAt,
      completedAt: entity.completedAt,
      trainingDays: entity.trainingDays.map((day) => ({
        id: day.id,
        name: day.name,
        dayOrder: day.dayOrder,
        plannedExercises: day.getExercisesInOrder().map((exercise) => ({
          id: exercise.id,
          exerciseId: exercise.exerciseId,
          exerciseOrder: exercise.exerciseOrder,
          targetSets: exercise.targetSets,
          targetRepsMin: exercise.targetRepsMin,
          targetRepsMax: exercise.targetRepsMax,
          targetRir: exercise.targetRir,
          tempo: exercise.tempo,
          supersetGroup: exercise.supersetGroup,
          setupNotes: exercise.setupNotes,
        })),
      })),
    };
  }
}
