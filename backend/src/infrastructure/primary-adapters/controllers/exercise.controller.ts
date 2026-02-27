import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ExerciseService } from '../../../application/services/exercise.service';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../decorators/current-user.decorator';
import { CreateExerciseDto } from './dtos/exercise/create-exercise.dto';
import { ExerciseResponseDto } from './dtos/exercise/exercise-response.dto';
import { ListExercisesQueryDto } from './dtos/exercise/list-exercises-query.dto';

@ApiTags('Exercises')
@Controller('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get()
  @ApiOperation({ summary: 'List exercises with filters and pagination' })
  @ApiResponse({ status: 200 })
  async list(@Query() query: ListExercisesQueryDto): Promise<{
    data: ExerciseResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const result = await this.exerciseService.listExercises(
      {
        movementPattern: query.movementPattern,
        difficulty: query.difficulty,
        equipmentType: query.equipmentType,
        muscleGroup: query.muscleGroup,
        search: query.search,
      },
      query.page ?? 1,
      query.limit ?? 20,
    );

    return {
      data: result.data.map((exercise) =>
        ExerciseResponseDto.fromEntity(exercise),
      ),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise detail' })
  @ApiResponse({ status: 200, type: ExerciseResponseDto })
  async detail(@Param('id') id: string): Promise<ExerciseResponseDto> {
    const exercise = await this.exerciseService.getExerciseDetail(id);
    return ExerciseResponseDto.fromEntity(exercise);
  }

  @Get(':id/substitutes')
  @ApiOperation({
    summary: 'Get exercise substitutes for current user equipment',
  })
  @ApiResponse({ status: 200, type: [ExerciseResponseDto] })
  async substitutes(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ExerciseResponseDto[]> {
    const data = await this.exerciseService.getSubstitutes(id, user.id);
    return data.map((item) => ExerciseResponseDto.fromEntity(item));
  }

  @Post()
  @ApiOperation({ summary: 'Create custom exercise' })
  @ApiResponse({ status: 201, type: ExerciseResponseDto })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateExerciseDto,
  ): Promise<ExerciseResponseDto> {
    const exercise = await this.exerciseService.createCustomExercise(
      user.id,
      dto.toEntity(),
    );

    return ExerciseResponseDto.fromEntity(exercise);
  }
}
