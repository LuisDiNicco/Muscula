import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class WeightTrendQueryDto {
  @ApiPropertyOptional({ default: 30, minimum: 1, maximum: 180 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(180)
  days?: number;
}
