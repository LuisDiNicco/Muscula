import { Module } from '@nestjs/common';
import { SESSION_HISTORY_REPOSITORY } from '../../../application/interfaces/session-history-repository.interface';
import { TRAINING_SESSION_REPOSITORY } from '../../../application/interfaces/training-session-repository.interface';
import { PrismaSessionRepository } from '../../secondary-adapters/database/session/prisma-session.repository';

@Module({
  providers: [
    {
      provide: TRAINING_SESSION_REPOSITORY,
      useClass: PrismaSessionRepository,
    },
    {
      provide: SESSION_HISTORY_REPOSITORY,
      useClass: PrismaSessionRepository,
    },
  ],
  exports: [TRAINING_SESSION_REPOSITORY, SESSION_HISTORY_REPOSITORY],
})
export class TrainingSessionPersistenceModule {}
