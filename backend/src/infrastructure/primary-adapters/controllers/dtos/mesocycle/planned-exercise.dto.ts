import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import type { CreatePlannedExerciseInput } from '../../../../../application/interfaces/mesocycle-repository.interface';

export class PlannedExerciseDto {
  @ApiProperty()
  @IsString()
  exerciseId!: string;

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  exerciseOrder!: number;

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  targetSets!: number;

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  targetRepsMin!: number;

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  targetRepsMax!: number;

  @ApiProperty({ minimum: 0, maximum: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  targetRir!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  tempo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  supersetGroup?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  setupNotes?: string;

  toEntity(): CreatePlannedExerciseInput {
    return {
      exerciseId: this.exerciseId,
      exerciseOrder: this.exerciseOrder,
      targetSets: this.targetSets,
      targetRepsMin: this.targetRepsMin,
      targetRepsMax: this.targetRepsMax,
      targetRir: this.targetRir,
      tempo: this.tempo?.trim(),
      supersetGroup: this.supersetGroup,
      setupNotes: this.setupNotes?.trim(),
    };
  }
}
