import { ApiProperty } from '@nestjs/swagger';
import { BodyMode, MealType } from '../../../../../domain/enums';
import { DailyNutritionResult } from '../../../../../application/services/nutrition.service';

class DailyEntryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  grams!: number;

  @ApiProperty()
  calories!: number;

  @ApiProperty()
  protein!: number;

  @ApiProperty()
  carbs!: number;

  @ApiProperty()
  fat!: number;
}

class DailyMealResponseDto {
  @ApiProperty()
  mealId!: string;

  @ApiProperty({ enum: MealType })
  mealType!: MealType;

  @ApiProperty({ type: [DailyEntryResponseDto] })
  entries!: DailyEntryResponseDto[];
}

class DailyTotalsResponseDto {
  @ApiProperty()
  calories!: number;

  @ApiProperty()
  protein!: number;

  @ApiProperty()
  carbs!: number;

  @ApiProperty()
  fat!: number;
}

export class DailyNutritionResponseDto {
  @ApiProperty()
  date!: string;

  @ApiProperty({ enum: BodyMode })
  bodyMode!: BodyMode;

  @ApiProperty({ type: [DailyMealResponseDto] })
  meals!: DailyMealResponseDto[];

  @ApiProperty({ type: DailyTotalsResponseDto })
  totals!: DailyTotalsResponseDto;

  @ApiProperty({ type: DailyTotalsResponseDto })
  targets!: DailyTotalsResponseDto;

  @ApiProperty()
  tdee!: number;

  static fromResult(result: DailyNutritionResult): DailyNutritionResponseDto {
    return {
      date: result.date.toISOString().slice(0, 10),
      bodyMode: result.bodyMode,
      meals: result.meals,
      totals: result.totals,
      targets: result.targets,
      tdee: result.tdee,
    };
  }
}
