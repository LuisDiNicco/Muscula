import { Module } from '@nestjs/common';
import { EquipmentProfileService } from '../../application/services/equipment-profile.service';
import { ExerciseService } from '../../application/services/exercise.service';
import { ExercisePersistenceModule } from '../base/modules/exercise-persistence.module';
import { EquipmentProfileController } from './controllers/equipment-profile.controller';
import { ExerciseController } from './controllers/exercise.controller';

@Module({
  imports: [ExercisePersistenceModule],
  controllers: [ExerciseController, EquipmentProfileController],
  providers: [ExerciseService, EquipmentProfileService],
})
export class ExerciseModule {}
