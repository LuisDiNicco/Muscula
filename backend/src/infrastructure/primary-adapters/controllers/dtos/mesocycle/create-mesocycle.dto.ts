import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type { CreateMesocycleInput } from '../../../../../application/interfaces/mesocycle-repository.interface';
import { TrainingObjective } from '../../../../../domain/enums';
import { TrainingDayDto } from './training-day.dto';

export class CreateMesocycleDto {
  @ApiProperty()
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ minimum: 3, maximum: 16 })
  @Type(() => Number)
  @IsInt()
  @Min(3)
  durationWeeks!: number;

  @ApiProperty({ enum: TrainingObjective })
  @IsEnum(TrainingObjective)
  objective!: TrainingObjective;

  @ApiProperty({ default: true })
  @Type(() => Boolean)
  @IsBoolean()
  includeDeload!: boolean;

  @ApiProperty({ type: () => [TrainingDayDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrainingDayDto)
  trainingDays!: TrainingDayDto[];

  toEntity(): Omit<CreateMesocycleInput, 'userId'> {
    return {
      name: this.name.trim(),
      description: this.description?.trim(),
      durationWeeks: this.durationWeeks,
      objective: this.objective,
      includeDeload: this.includeDeload,
      trainingDays: this.trainingDays.map((day) => day.toEntity()),
    };
  }
}
