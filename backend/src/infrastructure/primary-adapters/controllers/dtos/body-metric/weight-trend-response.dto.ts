import { ApiProperty } from '@nestjs/swagger';

export class WeightTrendResponseDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  weightKg!: number;

  @ApiProperty()
  movingAverage7d!: number;
}
