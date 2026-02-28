import { ApiProperty } from '@nestjs/swagger';
import { TrainingObjective } from '../../../../../domain/enums';
import type {
  ImportedRoutineResult,
  SharedRoutinePreview,
} from '../../../../../application/interfaces/routine-sharing-repository.interface';

class SharedPlannedExerciseResponseDto {
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
}

class SharedTrainingDayResponseDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  dayOrder!: number;

  @ApiProperty({ type: SharedPlannedExerciseResponseDto, isArray: true })
  plannedExercises!: SharedPlannedExerciseResponseDto[];
}

class SharedMesocycleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  durationWeeks!: number;

  @ApiProperty({ enum: TrainingObjective })
  objective!: TrainingObjective;

  @ApiProperty()
  includeDeload!: boolean;

  @ApiProperty({ type: SharedTrainingDayResponseDto, isArray: true })
  trainingDays!: SharedTrainingDayResponseDto[];
}

export class SharedRoutineResponseDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  expiresAt!: string;

  @ApiProperty()
  viewCount!: number;

  @ApiProperty({ type: SharedMesocycleResponseDto })
  mesocycle!: SharedMesocycleResponseDto;

  static fromResult(result: SharedRoutinePreview): SharedRoutineResponseDto {
    return {
      code: result.code,
      expiresAt: result.expiresAt.toISOString(),
      viewCount: result.viewCount,
      mesocycle: {
        ...result.mesocycle,
      },
    };
  }
}

export class ImportSharedRoutineResponseDto {
  @ApiProperty()
  mesocycleId!: string;

  @ApiProperty()
  name!: string;

  static fromResult(
    result: ImportedRoutineResult,
  ): ImportSharedRoutineResponseDto {
    return {
      mesocycleId: result.mesocycleId,
      name: result.name,
    };
  }
}
