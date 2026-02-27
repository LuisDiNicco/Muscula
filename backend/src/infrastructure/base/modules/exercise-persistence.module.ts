import { Module } from '@nestjs/common';
import { EXERCISE_REPOSITORY } from '../../../application/interfaces/exercise-repository.interface';
import { EQUIPMENT_PROFILE_REPOSITORY } from '../../../application/interfaces/equipment-profile-repository.interface';
import { PrismaExerciseRepository } from '../../secondary-adapters/database/exercise/prisma-exercise.repository';
import { PrismaEquipmentProfileRepository } from '../../secondary-adapters/database/equipment/prisma-equipment-profile.repository';

@Module({
  providers: [
    {
      provide: EXERCISE_REPOSITORY,
      useClass: PrismaExerciseRepository,
    },
    {
      provide: EQUIPMENT_PROFILE_REPOSITORY,
      useClass: PrismaEquipmentProfileRepository,
    },
  ],
  exports: [EXERCISE_REPOSITORY, EQUIPMENT_PROFILE_REPOSITORY],
})
export class ExercisePersistenceModule {}
