import { Module } from '@nestjs/common';
import { IMPORT_EXPORT_REPOSITORY } from '../../../application/interfaces/import-export-repository.interface';
import { PrismaImportExportRepository } from '../../secondary-adapters/database/import-export/prisma-import-export.repository';

@Module({
  providers: [
    {
      provide: IMPORT_EXPORT_REPOSITORY,
      useClass: PrismaImportExportRepository,
    },
  ],
  exports: [IMPORT_EXPORT_REPOSITORY],
})
export class ImportExportPersistenceModule {}
