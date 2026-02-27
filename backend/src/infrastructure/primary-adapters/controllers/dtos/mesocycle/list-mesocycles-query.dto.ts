import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  MesocycleStatus,
  TrainingObjective,
} from '../../../../../domain/enums';

export class ListMesocyclesQueryDto {
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

  @ApiPropertyOptional({ enum: MesocycleStatus })
  @IsOptional()
  @IsEnum(MesocycleStatus)
  status?: MesocycleStatus;

  @ApiPropertyOptional({ enum: TrainingObjective })
  @IsOptional()
  @IsEnum(TrainingObjective)
  objective?: TrainingObjective;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
