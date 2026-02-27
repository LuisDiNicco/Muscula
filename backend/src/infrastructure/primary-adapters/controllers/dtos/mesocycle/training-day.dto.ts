import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type { CreateTrainingDayInput } from '../../../../../application/interfaces/mesocycle-repository.interface';
import { PlannedExerciseDto } from './planned-exercise.dto';

export class TrainingDayDto {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dayOrder!: number;

  @ApiProperty({ type: () => [PlannedExerciseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlannedExerciseDto)
  plannedExercises!: PlannedExerciseDto[];

  toEntity(): CreateTrainingDayInput {
    return {
      name: this.name.trim(),
      dayOrder: this.dayOrder,
      plannedExercises: this.plannedExercises.map((exercise) =>
        exercise.toEntity(),
      ),
    };
  }
}
