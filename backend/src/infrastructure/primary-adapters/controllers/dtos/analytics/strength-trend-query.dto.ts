import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { AnalyticsPeriodDto } from './analytics-period.enum';

export class StrengthTrendQueryDto {
  @ApiProperty({ description: 'Exercise id' })
  @IsString()
  exerciseId!: string;

  @ApiPropertyOptional({
    enum: AnalyticsPeriodDto,
    default: AnalyticsPeriodDto.DAYS_90,
  })
  @IsEnum(AnalyticsPeriodDto)
  period: AnalyticsPeriodDto = AnalyticsPeriodDto.DAYS_90;
}
