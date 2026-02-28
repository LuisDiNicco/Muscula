import { Module } from '@nestjs/common';
import { MesocycleService } from '../../application/services/mesocycle.service';
import { AchievementModule } from './achievement.module';
import { MesocyclePersistenceModule } from '../base/modules/mesocycle-persistence.module';
import { MesocycleController } from './controllers/mesocycle.controller';
import { TrainingDayController } from './controllers/training-day.controller';

@Module({
  imports: [MesocyclePersistenceModule, AchievementModule],
  controllers: [MesocycleController, TrainingDayController],
  providers: [MesocycleService],
})
export class MesocycleModule {}
