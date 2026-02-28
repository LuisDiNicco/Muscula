import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BodyMetricService } from '../../../application/services/body-metric.service';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../decorators/current-user.decorator';
import { BodyMetricResponseDto } from './dtos/body-metric/body-metric-response.dto';
import { ListBodyMetricQueryDto } from './dtos/body-metric/list-body-metric-query.dto';
import { RecordBodyMetricDto } from './dtos/body-metric/record-body-metric.dto';
import { WeightTrendQueryDto } from './dtos/body-metric/weight-trend-query.dto';
import { WeightTrendResponseDto } from './dtos/body-metric/weight-trend-response.dto';

@ApiTags('Body Metrics')
@Controller('body-metrics')
export class BodyMetricController {
  constructor(private readonly bodyMetricService: BodyMetricService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update body metric for a day' })
  @ApiResponse({ status: 201 })
  async record(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: RecordBodyMetricDto,
  ): Promise<void> {
    await this.bodyMetricService.recordMetrics(user.id, dto.toEntity());
  }

  @Get()
  @ApiOperation({ summary: 'List body metrics in date range' })
  @ApiResponse({ status: 200, type: [BodyMetricResponseDto] })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListBodyMetricQueryDto,
  ): Promise<BodyMetricResponseDto[]> {
    const data = await this.bodyMetricService.getMetrics(
      user.id,
      new Date(`${query.from}T00:00:00.000Z`),
      new Date(`${query.to}T00:00:00.000Z`),
    );

    return data.map((item) => BodyMetricResponseDto.fromData(item));
  }

  @Get('weight-trend')
  @ApiOperation({ summary: 'Get body weight trend with 7-day moving average' })
  @ApiResponse({ status: 200, type: [WeightTrendResponseDto] })
  async getWeightTrend(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: WeightTrendQueryDto,
  ): Promise<WeightTrendResponseDto[]> {
    const points = await this.bodyMetricService.getWeightTrend(
      user.id,
      query.days ?? 30,
    );

    return points.map((point) => ({
      date: point.date.toISOString().slice(0, 10),
      weightKg: point.weightKg,
      movingAverage7d: point.movingAverage7d,
    }));
  }
}
