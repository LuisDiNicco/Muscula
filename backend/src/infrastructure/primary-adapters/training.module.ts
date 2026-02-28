import { Module } from '@nestjs/common';
import { AutoregulationService } from '../../application/services/autoregulation.service';
import { ExerciseSubstitutionService } from '../../application/services/exercise-substitution.service';
import { ReadinessService } from '../../application/services/readiness.service';
import { TrainingSessionService } from '../../application/services/training-session.service';
import { WarmupGeneratorService } from '../../application/services/warmup-generator.service';
import { ExercisePersistenceModule } from '../base/modules/exercise-persistence.module';
import { TrainingSessionPersistenceModule } from '../base/modules/training-session-persistence.module';
import { TrainingController } from './controllers/training.controller';

@Module({
  imports: [TrainingSessionPersistenceModule, ExercisePersistenceModule],
  controllers: [TrainingController],
  providers: [
    TrainingSessionService,
    WarmupGeneratorService,
    AutoregulationService,
    ReadinessService,
    ExerciseSubstitutionService,
  ],
})
export class TrainingModule {}
