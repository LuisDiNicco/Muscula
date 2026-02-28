import { Module } from '@nestjs/common';
import { ImportExportService } from '../../application/services/import-export.service';
import { ImportExportPersistenceModule } from '../base/modules/import-export-persistence.module';
import { NutritionPersistenceModule } from '../base/modules/nutrition-persistence.module';
import { ImportExportController } from './controllers/import-export.controller';

@Module({
  imports: [ImportExportPersistenceModule, NutritionPersistenceModule],
  controllers: [ImportExportController],
  providers: [ImportExportService],
})
export class ImportExportModule {}
