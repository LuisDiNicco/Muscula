import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum } from 'class-validator';
import { MealType } from '../../../../../domain/enums';

export class EnsureMealDto {
  @ApiProperty({ example: '2026-02-28' })
  @IsDateString()
  date!: string;

  @ApiProperty({ enum: MealType })
  @IsEnum(MealType)
  mealType!: MealType;

  toEntity(): { date: Date; mealType: MealType } {
    return {
      date: new Date(`${this.date}T00:00:00.000Z`),
      mealType: this.mealType,
    };
  }
}
