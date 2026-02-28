import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { AnalyticsPeriodDto } from './analytics-period.enum';

export class PersonalRecordsQueryDto {
  @ApiProperty({ description: 'Exercise id' })
  @IsString()
  exerciseId!: string;

  @ApiPropertyOptional({
    enum: AnalyticsPeriodDto,
    default: AnalyticsPeriodDto.ALL,
  })
  @IsEnum(AnalyticsPeriodDto)
  period: AnalyticsPeriodDto = AnalyticsPeriodDto.ALL;
}
