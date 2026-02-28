import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NutritionService } from '../../../application/services/nutrition.service';
import { MealType } from '../../../domain/enums';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../decorators/current-user.decorator';
import { AddFoodEntryDto } from './dtos/nutrition/add-food-entry.dto';
import { BodyModeResponseDto } from './dtos/nutrition/body-mode-response.dto';
import { CreateCustomFoodDto } from './dtos/nutrition/create-custom-food.dto';
import { DailyNutritionQueryDto } from './dtos/nutrition/daily-nutrition-query.dto';
import { DailyNutritionResponseDto } from './dtos/nutrition/daily-nutrition-response.dto';
import { EnsureMealDto } from './dtos/nutrition/ensure-meal.dto';
import { EnsureMealResponseDto } from './dtos/nutrition/ensure-meal-response.dto';
import { FoodSearchResponseDto } from './dtos/nutrition/food-search-response.dto';
import { SearchFoodsQueryDto } from './dtos/nutrition/search-foods-query.dto';
import { SetBodyModeDto } from './dtos/nutrition/set-body-mode.dto';

@ApiTags('Nutrition')
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Get daily nutrition summary and targets' })
  @ApiResponse({ status: 200, type: DailyNutritionResponseDto })
  async getDailyNutrition(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: DailyNutritionQueryDto,
  ): Promise<DailyNutritionResponseDto> {
    const date = query.date
      ? new Date(`${query.date}T00:00:00.000Z`)
      : new Date();
    const result = await this.nutritionService.getDailyNutrition(user.id, date);
    return DailyNutritionResponseDto.fromResult(result);
  }

  @Post('meals')
  @ApiOperation({
    summary: 'Create or return existing meal slot for date and type',
  })
  @ApiResponse({ status: 201, type: EnsureMealResponseDto })
  async ensureMeal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EnsureMealDto,
  ): Promise<EnsureMealResponseDto> {
    return this.nutritionService.ensureMeal(
      user.id,
      dto.toEntity().date,
      dto.toEntity().mealType,
    );
  }

  @Post('meals/:mealId/entries')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add a food entry to a meal' })
  async addFoodEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Param('mealId') mealId: string,
    @Body() dto: AddFoodEntryDto,
  ): Promise<void> {
    await this.nutritionService.addFoodEntry(user.id, mealId, dto.toEntity());
  }

  @Delete('entries/:entryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete food entry from meal' })
  async deleteFoodEntry(
    @CurrentUser() user: AuthenticatedUser,
    @Param('entryId') entryId: string,
  ): Promise<void> {
    await this.nutritionService.deleteFoodEntry(user.id, entryId);
  }

  @Get('foods/search')
  @ApiOperation({ summary: 'Search foods by text query' })
  @ApiResponse({ status: 200, type: FoodSearchResponseDto })
  async searchFoods(
    @Query() query: SearchFoodsQueryDto,
  ): Promise<FoodSearchResponseDto> {
    return this.nutritionService.searchFoods(
      query.query,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Get('foods/barcode/:barcode')
  @ApiOperation({ summary: 'Search food by barcode' })
  async searchFoodByBarcode(
    @Param('barcode') barcode: string,
  ): Promise<FoodSearchResponseDto> {
    const item = await this.nutritionService.searchFoodByBarcode(barcode);
    return {
      data: item === null ? [] : [item],
      total: item === null ? 0 : 1,
    };
  }

  @Post('foods/custom')
  @ApiOperation({ summary: 'Create a custom food item' })
  async createCustomFood(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCustomFoodDto,
  ): Promise<{ id: string; name: string }> {
    return this.nutritionService.createCustomFood(user.id, dto.toEntity());
  }

  @Get('body-mode')
  @ApiOperation({ summary: 'Get current body mode' })
  @ApiResponse({ status: 200, type: BodyModeResponseDto })
  async getBodyMode(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BodyModeResponseDto> {
    return {
      mode: await this.nutritionService.getBodyMode(user.id),
    };
  }

  @Put('body-mode')
  @ApiOperation({ summary: 'Set body mode and recompute daily macro targets' })
  @ApiResponse({ status: 200, type: BodyModeResponseDto })
  async setBodyMode(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SetBodyModeDto,
  ): Promise<BodyModeResponseDto> {
    return this.nutritionService.setBodyMode(user.id, dto.mode);
  }

  @Get('meal-types')
  @ApiOperation({ summary: 'List meal types for client forms' })
  @ApiResponse({ status: 200, type: [String] })
  getMealTypes(): MealType[] {
    return Object.values(MealType);
  }
}
