import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class SuggestWeightQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: 5,
    description: 'Optional readiness score used to adjust suggestion',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  readinessScore?: number;
}
