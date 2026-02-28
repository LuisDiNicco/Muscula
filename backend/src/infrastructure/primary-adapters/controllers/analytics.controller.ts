import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from '../../../application/services/analytics.service';
import { VolumeTrackerService } from '../../../application/services/volume-tracker.service';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../decorators/current-user.decorator';
import { CorrelationQueryDto } from './dtos/analytics/correlation-query.dto';
import { CorrelationResponseDto } from './dtos/analytics/correlation-response.dto';
import { DeloadCheckResponseDto } from './dtos/analytics/deload-check-response.dto';
import { HeatmapResponseDto } from './dtos/analytics/heatmap-response.dto';
import { PersonalRecordsQueryDto } from './dtos/analytics/personal-records-query.dto';
import { PersonalRecordsResponseDto } from './dtos/analytics/personal-records-response.dto';
import { StrengthTrendQueryDto } from './dtos/analytics/strength-trend-query.dto';
import { StrengthTrendResponseDto } from './dtos/analytics/strength-trend-response.dto';
import { TonnageTrendQueryDto } from './dtos/analytics/tonnage-trend-query.dto';
import { TonnageTrendResponseDto } from './dtos/analytics/tonnage-trend-response.dto';
import { VolumeHistoryQueryDto } from './dtos/analytics/volume-history-query.dto';
import { VolumeHistoryResponseDto } from './dtos/analytics/volume-history-response.dto';
import { WeeklyVolumeQueryDto } from './dtos/analytics/weekly-volume-query.dto';
import { WeeklyVolumeResponseDto } from './dtos/analytics/weekly-volume-response.dto';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly volumeTrackerService: VolumeTrackerService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  @Get('volume/weekly')
  @ApiOperation({ summary: 'Get effective weekly volume by muscle group' })
  @ApiResponse({ status: 200, type: WeeklyVolumeResponseDto })
  async getWeeklyVolume(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: WeeklyVolumeQueryDto,
  ): Promise<WeeklyVolumeResponseDto> {
    const result = await this.volumeTrackerService.getWeeklyVolume(
      user.id,
      query.weekOffset ?? 0,
    );

    return WeeklyVolumeResponseDto.fromResult(result);
  }

  @Get('volume/history')
  @ApiOperation({ summary: 'Get weekly volume history by muscle group' })
  @ApiResponse({ status: 200, type: VolumeHistoryResponseDto })
  async getVolumeHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: VolumeHistoryQueryDto,
  ): Promise<VolumeHistoryResponseDto> {
    const result = await this.volumeTrackerService.getVolumeHistory(
      user.id,
      query.weeks ?? 8,
    );

    return VolumeHistoryResponseDto.fromResult(result);
  }

  @Get('deload/check')
  @ApiOperation({ summary: 'Check whether a deload is currently recommended' })
  @ApiResponse({ status: 200, type: DeloadCheckResponseDto })
  async checkDeload(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DeloadCheckResponseDto> {
    const result = await this.analyticsService.checkDeload(user.id);
    return DeloadCheckResponseDto.fromResult(result);
  }

  @Get('heatmap')
  @ApiOperation({ summary: 'Get muscle heatmap and recovery status' })
  @ApiResponse({ status: 200, type: HeatmapResponseDto })
  async getHeatmap(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HeatmapResponseDto> {
    const result = await this.analyticsService.getMuscleHeatmap(user.id);
    return HeatmapResponseDto.fromResult(result);
  }

  @Get('strength')
  @ApiOperation({ summary: 'Get estimated 1RM trend for an exercise' })
  @ApiResponse({ status: 200, type: StrengthTrendResponseDto })
  async getStrengthTrend(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: StrengthTrendQueryDto,
  ): Promise<StrengthTrendResponseDto> {
    const result = await this.analyticsService.getStrengthTrend(
      user.id,
      query.exerciseId,
      query.period,
    );

    return StrengthTrendResponseDto.fromResult(result);
  }

  @Get('tonnage')
  @ApiOperation({ summary: 'Get tonnage trend for an exercise' })
  @ApiResponse({ status: 200, type: TonnageTrendResponseDto })
  async getTonnageTrend(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: TonnageTrendQueryDto,
  ): Promise<TonnageTrendResponseDto> {
    const result = await this.analyticsService.getTonnageTrend(
      user.id,
      query.exerciseId,
      query.period,
    );

    return TonnageTrendResponseDto.fromResult(result);
  }

  @Get('prs')
  @ApiOperation({ summary: 'Get personal records for an exercise' })
  @ApiResponse({ status: 200, type: PersonalRecordsResponseDto })
  async getPersonalRecords(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: PersonalRecordsQueryDto,
  ): Promise<PersonalRecordsResponseDto> {
    const result = await this.analyticsService.getPersonalRecords(
      user.id,
      query.exerciseId,
      query.period,
    );

    return PersonalRecordsResponseDto.fromResult(result);
  }

  @Get('correlations')
  @ApiOperation({ summary: 'Get analytics correlation points by type' })
  @ApiResponse({ status: 200, type: CorrelationResponseDto })
  async getCorrelations(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: CorrelationQueryDto,
  ): Promise<CorrelationResponseDto> {
    const result = await this.analyticsService.getCorrelations(
      user.id,
      query.type,
      query.period,
      query.exerciseId,
    );

    return CorrelationResponseDto.fromResult(result);
  }
}
