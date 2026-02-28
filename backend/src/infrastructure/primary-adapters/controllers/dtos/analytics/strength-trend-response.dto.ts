import { ApiProperty } from '@nestjs/swagger';
import { StrengthTrendPoint } from '../../../../../application/services/analytics.service';

export class StrengthTrendPointResponseDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  estimatedOneRm!: number;

  static fromPoint(point: StrengthTrendPoint): StrengthTrendPointResponseDto {
    return {
      date: point.date.toISOString(),
      estimatedOneRm: point.estimatedOneRm,
    };
  }
}

export class StrengthTrendResponseDto {
  @ApiProperty({ type: StrengthTrendPointResponseDto, isArray: true })
  points!: StrengthTrendPointResponseDto[];

  static fromResult(points: StrengthTrendPoint[]): StrengthTrendResponseDto {
    return {
      points: points.map((point) =>
        StrengthTrendPointResponseDto.fromPoint(point),
      ),
    };
  }
}
