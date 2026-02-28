import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class VolumeHistoryQueryDto {
  @ApiPropertyOptional({
    default: 8,
    minimum: 1,
    maximum: 24,
    description: 'Number of weeks to include counting backwards from current',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24)
  weeks?: number;
}
