import { ApiProperty } from '@nestjs/swagger';
import { TonnageTrendPoint } from '../../../../../application/services/analytics.service';

export class TonnageTrendPointResponseDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  tonnage!: number;

  static fromPoint(point: TonnageTrendPoint): TonnageTrendPointResponseDto {
    return {
      date: point.date.toISOString(),
      tonnage: point.tonnage,
    };
  }
}

export class TonnageTrendResponseDto {
  @ApiProperty({ type: TonnageTrendPointResponseDto, isArray: true })
  points!: TonnageTrendPointResponseDto[];

  static fromResult(points: TonnageTrendPoint[]): TonnageTrendResponseDto {
    return {
      points: points.map((point) =>
        TonnageTrendPointResponseDto.fromPoint(point),
      ),
    };
  }
}
