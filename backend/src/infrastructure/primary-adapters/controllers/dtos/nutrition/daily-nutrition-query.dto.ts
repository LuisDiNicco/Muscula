import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class DailyNutritionQueryDto {
  @ApiPropertyOptional({
    description: 'Date in YYYY-MM-DD format. Defaults to current UTC day',
    example: '2026-02-28',
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
