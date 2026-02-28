import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCustomFoodDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  caloriesPer100g!: number;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  proteinPer100g!: number;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  carbsPer100g!: number;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fatPer100g!: number;

  toEntity(): {
    name: string;
    brand?: string;
    barcode?: string;
    caloriesPer100g: number;
    proteinPer100g: number;
    carbsPer100g: number;
    fatPer100g: number;
  } {
    return {
      name: this.name,
      brand: this.brand,
      barcode: this.barcode,
      caloriesPer100g: this.caloriesPer100g,
      proteinPer100g: this.proteinPer100g,
      carbsPer100g: this.carbsPer100g,
      fatPer100g: this.fatPer100g,
    };
  }
}
