import { ApiProperty } from '@nestjs/swagger';

export class WarmupSetResponseDto {
  @ApiProperty()
  setOrder!: number;

  @ApiProperty()
  weightKg!: number;

  @ApiProperty()
  reps!: number;

  @ApiProperty()
  completed!: boolean;
}
