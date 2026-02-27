import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Min, IsInt } from 'class-validator';
import type { StartSessionInput } from '../../../../../application/interfaces/training-session-repository.interface';

export class StartSessionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsUUID()
  mesocycleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsUUID()
  trainingDayId?: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  weekNumber?: number;

  toEntity(userId: string): StartSessionInput {
    return {
      userId,
      mesocycleId: this.mesocycleId,
      trainingDayId: this.trainingDayId,
      weekNumber: this.weekNumber,
    };
  }
}
