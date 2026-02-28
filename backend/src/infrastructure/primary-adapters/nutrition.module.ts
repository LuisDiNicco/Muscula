import { Module } from '@nestjs/common';
import { BodyMetricService } from '../../application/services/body-metric.service';
import { NutritionService } from '../../application/services/nutrition.service';
import { ProgressPhotoService } from '../../application/services/progress-photo.service';
import { TdeeCalculatorService } from '../../application/services/tdee-calculator.service';
import { NutritionPersistenceModule } from '../base/modules/nutrition-persistence.module';
import { PersistenceModule } from '../base/modules/persistence.module';
import { BodyMetricController } from './controllers/body-metric.controller';
import { NutritionController } from './controllers/nutrition.controller';

@Module({
  imports: [PersistenceModule, NutritionPersistenceModule],
  controllers: [NutritionController, BodyMetricController],
  providers: [
    NutritionService,
    TdeeCalculatorService,
    BodyMetricService,
    ProgressPhotoService,
  ],
})
export class NutritionModule {}
