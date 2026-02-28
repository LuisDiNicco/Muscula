import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AnalyticsPeriodDto } from './analytics-period.enum';
import { CorrelationTypeDto } from './correlation-type.enum';

export class CorrelationQueryDto {
  @ApiProperty({ enum: CorrelationTypeDto })
  @IsEnum(CorrelationTypeDto)
  type!: CorrelationTypeDto;

  @ApiPropertyOptional({
    enum: AnalyticsPeriodDto,
    default: AnalyticsPeriodDto.DAYS_90,
  })
  @IsEnum(AnalyticsPeriodDto)
  period: AnalyticsPeriodDto = AnalyticsPeriodDto.DAYS_90;

  @ApiPropertyOptional({
    description: 'Required for BODY_WEIGHT_VS_1RM correlation type',
  })
  @IsOptional()
  @IsString()
  exerciseId?: string;
}
