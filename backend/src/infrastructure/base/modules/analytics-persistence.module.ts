import { Module } from '@nestjs/common';
import { ANALYTICS_REPOSITORY } from '../../../application/interfaces/analytics-repository.interface';
import { PrismaSessionRepository } from '../../secondary-adapters/database/session/prisma-session.repository';

@Module({
  providers: [
    {
      provide: ANALYTICS_REPOSITORY,
      useClass: PrismaSessionRepository,
    },
  ],
  exports: [ANALYTICS_REPOSITORY],
})
export class AnalyticsPersistenceModule {}
