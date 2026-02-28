import { Module } from '@nestjs/common';
import { AchievementService } from '../../application/services/achievement.service';
import { AchievementPersistenceModule } from '../base/modules/achievement-persistence.module';
import { AchievementController } from './controllers/achievement.controller';

@Module({
  imports: [AchievementPersistenceModule],
  controllers: [AchievementController],
  providers: [AchievementService],
  exports: [AchievementService],
})
export class AchievementModule {}
