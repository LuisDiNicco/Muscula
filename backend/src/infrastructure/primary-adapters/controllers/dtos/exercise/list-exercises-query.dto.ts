import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  DifficultyLevel,
  EquipmentType,
  MovementPattern,
  MuscleGroup,
} from '../../../../../domain/enums';

export class ListExercisesQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: MovementPattern })
  @IsOptional()
  @IsEnum(MovementPattern)
  movementPattern?: MovementPattern;

  @ApiPropertyOptional({ enum: DifficultyLevel })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiPropertyOptional({ enum: EquipmentType })
  @IsOptional()
  @IsEnum(EquipmentType)
  equipmentType?: EquipmentType;

  @ApiPropertyOptional({ enum: MuscleGroup })
  @IsOptional()
  @IsEnum(MuscleGroup)
  muscleGroup?: MuscleGroup;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
