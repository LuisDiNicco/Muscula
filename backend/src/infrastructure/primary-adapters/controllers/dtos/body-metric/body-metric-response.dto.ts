import { ApiProperty } from '@nestjs/swagger';

export class BodyMetricResponseDto {
  @ApiProperty()
  date!: string;

  @ApiProperty({ nullable: true })
  weightKg!: number | null;

  static fromData(data: {
    date: Date;
    weightKg: number | null;
  }): BodyMetricResponseDto {
    return {
      date: data.date.toISOString().slice(0, 10),
      weightKg: data.weightKg,
    };
  }
}
