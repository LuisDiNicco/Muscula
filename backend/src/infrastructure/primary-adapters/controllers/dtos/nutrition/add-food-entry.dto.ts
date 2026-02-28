import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AddFoodEntryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  foodId?: string;

  @ApiPropertyOptional({ description: 'Required when foodId is omitted' })
  @IsOptional()
  @IsString()
  customFoodName?: string;

  @ApiPropertyOptional({ minimum: 1, default: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  grams!: number;

  toEntity(): {
    foodId?: string;
    customFoodName?: string;
    grams: number;
  } {
    return {
      foodId: this.foodId,
      customFoodName: this.customFoodName,
      grams: this.grams,
    };
  }
}
