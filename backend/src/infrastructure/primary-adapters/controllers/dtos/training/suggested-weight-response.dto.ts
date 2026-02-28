import { ApiProperty } from '@nestjs/swagger';

export class SuggestedWeightResponseDto {
  @ApiProperty({ nullable: true })
  suggestedWeightKg!: number | null;
}
