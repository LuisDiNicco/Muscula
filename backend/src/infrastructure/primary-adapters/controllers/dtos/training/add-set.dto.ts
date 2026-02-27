import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import type { AddSetInput } from '../../../../../application/interfaces/training-session-repository.interface';

export class AddSetDto {
  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightKg!: number;

  @ApiProperty({ minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  reps!: number;

  @ApiProperty({ minimum: 0, maximum: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  rir!: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  restTimeSec?: number;

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;

  @ApiProperty({ default: true })
  @Type(() => Boolean)
  @IsBoolean()
  completed!: boolean;

  @ApiProperty({ default: false })
  @Type(() => Boolean)
  @IsBoolean()
  skipped!: boolean;

  toEntity(): AddSetInput {
    return {
      weightKg: this.weightKg,
      reps: this.reps,
      rir: this.rir,
      restTimeSec: this.restTimeSec,
      notes: this.notes?.trim(),
      completed: this.completed,
      skipped: this.skipped,
    };
  }
}
