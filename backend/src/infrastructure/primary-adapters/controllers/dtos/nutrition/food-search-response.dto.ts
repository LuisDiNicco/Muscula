import { ApiProperty } from '@nestjs/swagger';

export class FoodSearchResponseItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  brand!: string | null;
}

export class FoodSearchResponseDto {
  @ApiProperty({ type: [FoodSearchResponseItemDto] })
  data!: FoodSearchResponseItemDto[];

  @ApiProperty()
  total!: number;
}
