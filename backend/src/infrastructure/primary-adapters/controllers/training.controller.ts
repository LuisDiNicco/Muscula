import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AutoregulationService } from '../../../application/services/autoregulation.service';
import { ExerciseSubstitutionService } from '../../../application/services/exercise-substitution.service';
import { ReadinessService } from '../../../application/services/readiness.service';
import { TrainingSessionService } from '../../../application/services/training-session.service';
import { WarmupGeneratorService } from '../../../application/services/warmup-generator.service';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../decorators/current-user.decorator';
import { ExerciseResponseDto } from './dtos/exercise/exercise-response.dto';
import { AddSetDto } from './dtos/training/add-set.dto';
import { AddSessionExerciseDto } from './dtos/training/add-session-exercise.dto';
import { CompleteSessionDto } from './dtos/training/complete-session.dto';
import { GenerateWarmupDto } from './dtos/training/generate-warmup.dto';
import { ListSessionsQueryDto } from './dtos/training/list-sessions-query.dto';
import { RecordReadinessDto } from './dtos/training/record-readiness.dto';
import { SessionDetailResponseDto } from './dtos/training/session-detail-response.dto';
import { StartSessionDto } from './dtos/training/start-session.dto';
import { SubstituteExerciseDto } from './dtos/training/substitute-exercise.dto';
import { SuggestedWeightResponseDto } from './dtos/training/suggested-weight-response.dto';
import { SuggestWeightQueryDto } from './dtos/training/suggest-weight-query.dto';
import { UpdateSetDto } from './dtos/training/update-set.dto';
import { WarmupSetResponseDto } from './dtos/training/warmup-set-response.dto';

@ApiTags('Training')
@Controller('training/sessions')
export class TrainingController {
  constructor(
    private readonly trainingSessionService: TrainingSessionService,
    private readonly autoregulationService: AutoregulationService,
    private readonly warmupGeneratorService: WarmupGeneratorService,
    private readonly exerciseSubstitutionService: ExerciseSubstitutionService,
    private readonly readinessService: ReadinessService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Start a new training session' })
  @ApiResponse({ status: 201, type: SessionDetailResponseDto })
  async startSession(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: StartSessionDto,
  ): Promise<SessionDetailResponseDto> {
    const session = await this.trainingSessionService.startSession(
      dto.toEntity(user.id),
    );

    return SessionDetailResponseDto.fromSession(session);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active training session' })
  @ApiResponse({ status: 200, type: SessionDetailResponseDto })
  async getActiveSession(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SessionDetailResponseDto | null> {
    const session = await this.trainingSessionService.getActiveSession(user.id);
    return session === null
      ? null
      : SessionDetailResponseDto.fromSession(session);
  }

  @Get()
  @ApiOperation({ summary: 'List user sessions' })
  @ApiResponse({ status: 200 })
  async listSessions(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListSessionsQueryDto,
  ): Promise<{
    data: SessionDetailResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const result = await this.trainingSessionService.listSessions(
      user.id,
      {
        status: query.status,
      },
      query.page ?? 1,
      query.limit ?? 20,
    );

    return {
      data: result.data.map((session) =>
        SessionDetailResponseDto.fromSession(session),
      ),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
      },
    };
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Get session detail' })
  @ApiResponse({ status: 200, type: SessionDetailResponseDto })
  async getSessionDetail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
  ): Promise<SessionDetailResponseDto> {
    const detail = await this.trainingSessionService.getSessionDetail(
      user.id,
      sessionId,
    );

    return SessionDetailResponseDto.fromEntity(detail);
  }

  @Get(':sessionId/exercises/:exerciseId/suggestion')
  @ApiOperation({ summary: 'Get suggested work weight for an exercise' })
  @ApiResponse({ status: 200, type: SuggestedWeightResponseDto })
  async suggestWeight(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Param('exerciseId') exerciseId: string,
    @Query() query: SuggestWeightQueryDto,
  ): Promise<SuggestedWeightResponseDto> {
    await this.trainingSessionService.getSessionDetail(user.id, sessionId);

    const suggestedWeightKg = await this.autoregulationService.suggestWeight(
      user.id,
      exerciseId,
      query.readinessScore,
    );

    return { suggestedWeightKg };
  }

  @Post(':sessionId/exercises/:exerciseId/warmup')
  @ApiOperation({ summary: 'Generate warmup sets for an exercise in session' })
  @ApiResponse({ status: 201, type: [WarmupSetResponseDto] })
  async generateWarmup(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Param('exerciseId') _exerciseId: string,
    @Body() dto: GenerateWarmupDto,
  ): Promise<WarmupSetResponseDto[]> {
    await this.trainingSessionService.getSessionDetail(user.id, sessionId);

    return this.warmupGeneratorService.generateWarmup(
      dto.workWeightKg,
      dto.barWeightKg,
    );
  }

  @Get(':sessionId/exercises/:exerciseId/substitutes')
  @ApiOperation({ summary: 'List valid substitutes for a session exercise' })
  @ApiResponse({ status: 200, type: [ExerciseResponseDto] })
  async listSubstitutes(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Param('exerciseId') exerciseId: string,
  ): Promise<ExerciseResponseDto[]> {
    await this.trainingSessionService.getSessionDetail(user.id, sessionId);
    const substitutes = await this.exerciseSubstitutionService.findSubstitutes(
      exerciseId,
      user.id,
    );

    return substitutes.map((exercise) =>
      ExerciseResponseDto.fromEntity(exercise),
    );
  }

  @Post(':sessionId/exercises/:exerciseId/substitute')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Replace a planned exercise by a valid substitute' })
  async substituteExercise(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() dto: SubstituteExerciseDto,
  ): Promise<void> {
    await this.exerciseSubstitutionService.substituteExercise(
      user.id,
      sessionId,
      exerciseId,
      dto.newExerciseId,
    );
  }

  @Post(':sessionId/exercises')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add exercise to session' })
  async addExercise(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Body() dto: AddSessionExerciseDto,
  ): Promise<void> {
    await this.trainingSessionService.addExerciseToSession(
      user.id,
      sessionId,
      dto.exerciseId,
      dto.order,
    );
  }

  @Delete(':sessionId/exercises/:exerciseId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove exercise from session' })
  async removeExercise(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Param('exerciseId') exerciseId: string,
  ): Promise<void> {
    await this.trainingSessionService.removeExerciseFromSession(
      user.id,
      sessionId,
      exerciseId,
    );
  }

  @Post(':sessionId/exercises/:exerciseId/sets')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add working set to session exercise' })
  async addSet(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Param('exerciseId') exerciseId: string,
    @Body() dto: AddSetDto,
  ): Promise<void> {
    await this.trainingSessionService.addSet(
      user.id,
      sessionId,
      exerciseId,
      dto.toEntity(),
    );
  }

  @Patch(':sessionId/sets/:setId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update working set' })
  async updateSet(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Param('setId') setId: string,
    @Body() dto: UpdateSetDto,
  ): Promise<void> {
    await this.trainingSessionService.updateSet(
      user.id,
      sessionId,
      setId,
      dto.toEntity(),
    );
  }

  @Delete(':sessionId/sets/:setId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete working set' })
  async deleteSet(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Param('setId') setId: string,
  ): Promise<void> {
    await this.trainingSessionService.deleteSet(user.id, sessionId, setId);
  }

  @Post(':sessionId/readiness')
  @ApiOperation({ summary: 'Record readiness score for session' })
  @ApiResponse({ status: 201 })
  async recordReadiness(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Body() dto: RecordReadinessDto,
  ): Promise<{ totalScore: number }> {
    return this.readinessService.recordReadiness(
      user.id,
      sessionId,
      dto.sleepScore,
      dto.stressScore,
      dto.domsScore,
    );
  }

  @Post(':sessionId/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Complete session' })
  async completeSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
    @Body() dto: CompleteSessionDto,
  ): Promise<void> {
    await this.trainingSessionService.completeSession(
      user.id,
      sessionId,
      dto.notes,
    );
  }

  @Post(':sessionId/abandon')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Abandon session' })
  async abandonSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    await this.trainingSessionService.abandonSession(user.id, sessionId);
  }
}
