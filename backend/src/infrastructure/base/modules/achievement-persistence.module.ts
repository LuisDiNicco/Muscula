import { Module } from '@nestjs/common';
import { ACHIEVEMENT_REPOSITORY } from '../../../application/interfaces/achievement-repository.interface';
import { PrismaAchievementRepository } from '../../secondary-adapters/database/achievement/prisma-achievement.repository';

@Module({
  providers: [
    {
      provide: ACHIEVEMENT_REPOSITORY,
      useClass: PrismaAchievementRepository,
    },
  ],
  exports: [ACHIEVEMENT_REPOSITORY],
})
export class AchievementPersistenceModule {}
