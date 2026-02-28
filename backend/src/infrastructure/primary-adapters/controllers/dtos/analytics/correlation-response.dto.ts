import { ApiProperty } from '@nestjs/swagger';
import { CorrelationResult } from '../../../../../application/services/analytics.service';
import { CorrelationTypeDto } from './correlation-type.enum';

class CorrelationPointResponseDto {
  @ApiProperty()
  x!: number;

  @ApiProperty()
  y!: number;

  @ApiProperty()
  date!: string;
}

export class CorrelationResponseDto {
  @ApiProperty({ enum: CorrelationTypeDto })
  type!: CorrelationTypeDto;

  @ApiProperty({ type: CorrelationPointResponseDto, isArray: true })
  points!: CorrelationPointResponseDto[];

  static fromResult(result: CorrelationResult): CorrelationResponseDto {
    return {
      type: result.type as CorrelationTypeDto,
      points: result.points.map((point) => ({
        x: point.x,
        y: point.y,
        date: point.date.toISOString(),
      })),
    };
  }
}
