import { ApiProperty } from '@nestjs/swagger';

export class EnsureMealResponseDto {
  @ApiProperty()
  mealId!: string;
}
