import { Module } from '@nestjs/common';
import { BODY_METRIC_REPOSITORY } from '../../../application/interfaces/body-metric-repository.interface';
import { FOOD_API_CLIENT } from '../../../application/interfaces/food-api-client.interface';
import { FILE_STORAGE_SERVICE } from '../../../application/interfaces/file-storage.interface';
import { NUTRITION_REPOSITORY } from '../../../application/interfaces/nutrition-repository.interface';
import { PROGRESS_PHOTO_REPOSITORY } from '../../../application/interfaces/progress-photo-repository.interface';
import { OpenFoodFactsClient } from '../../secondary-adapters/http/open-food-facts.client';
import { PrismaBodyMetricRepository } from '../../secondary-adapters/database/nutrition/prisma-body-metric.repository';
import { PrismaNutritionRepository } from '../../secondary-adapters/database/nutrition/prisma-nutrition.repository';
import { PrismaProgressPhotoRepository } from '../../secondary-adapters/database/nutrition/prisma-progress-photo.repository';
import { LocalFileStorageService } from '../../secondary-adapters/storage/local-file-storage.service';

@Module({
  providers: [
    {
      provide: NUTRITION_REPOSITORY,
      useClass: PrismaNutritionRepository,
    },
    {
      provide: BODY_METRIC_REPOSITORY,
      useClass: PrismaBodyMetricRepository,
    },
    {
      provide: PROGRESS_PHOTO_REPOSITORY,
      useClass: PrismaProgressPhotoRepository,
    },
    {
      provide: FOOD_API_CLIENT,
      useClass: OpenFoodFactsClient,
    },
    {
      provide: FILE_STORAGE_SERVICE,
      useClass: LocalFileStorageService,
    },
  ],
  exports: [
    NUTRITION_REPOSITORY,
    BODY_METRIC_REPOSITORY,
    PROGRESS_PHOTO_REPOSITORY,
    FOOD_API_CLIENT,
    FILE_STORAGE_SERVICE,
  ],
})
export class NutritionPersistenceModule {}
