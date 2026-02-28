import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class RecordBodyMetricDto {
  @ApiPropertyOptional({ example: '2026-02-28' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bodyFatPercentage?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  waistCm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  chestCm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  armCm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  thighCm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  toEntity(): {
    date: Date;
    weightKg?: number;
    bodyFatPercentage?: number;
    waistCm?: number;
    chestCm?: number;
    armCm?: number;
    thighCm?: number;
    notes?: string;
  } {
    return {
      date: this.date ? new Date(`${this.date}T00:00:00.000Z`) : new Date(),
      weightKg: this.weightKg,
      bodyFatPercentage: this.bodyFatPercentage,
      waistCm: this.waistCm,
      chestCm: this.chestCm,
      armCm: this.armCm,
      thighCm: this.thighCm,
      notes: this.notes,
    };
  }
}
