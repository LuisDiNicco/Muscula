import { Module } from '@nestjs/common';
import { AnalyticsService } from '../../application/services/analytics.service';
import { VolumeTrackerService } from '../../application/services/volume-tracker.service';
import { AnalyticsPersistenceModule } from '../base/modules/analytics-persistence.module';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  imports: [AnalyticsPersistenceModule],
  controllers: [AnalyticsController],
  providers: [VolumeTrackerService, AnalyticsService],
})
export class AnalyticsModule {}
