import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class GenerateWarmupDto {
  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  workWeightKg!: number;

  @ApiPropertyOptional({ minimum: 0, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  barWeightKg?: number;
}
