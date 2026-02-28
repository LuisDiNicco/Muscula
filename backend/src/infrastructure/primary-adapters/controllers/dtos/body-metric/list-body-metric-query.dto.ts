import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ListBodyMetricQueryDto {
  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  from!: string;

  @ApiProperty({ example: '2026-02-28' })
  @IsDateString()
  to!: string;
}
