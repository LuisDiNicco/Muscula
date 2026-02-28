import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from '../../../application/services/analytics.service';
import { VolumeTrackerService } from '../../../application/services/volume-tracker.service';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../decorators/current-user.decorator';
import { DeloadCheckResponseDto } from './dtos/analytics/deload-check-response.dto';
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
}
