import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class WeeklyVolumeQueryDto {
  @ApiPropertyOptional({
    default: 0,
    minimum: 0,
    maximum: 52,
    description: 'Week offset where 0 is current week and 1 is previous week',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(52)
  weekOffset?: number;
}
