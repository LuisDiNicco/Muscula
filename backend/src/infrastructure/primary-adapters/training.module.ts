import { Module } from '@nestjs/common';
import { AutoregulationService } from '../../application/services/autoregulation.service';
import { ReadinessService } from '../../application/services/readiness.service';
import { TrainingSessionService } from '../../application/services/training-session.service';
import { WarmupGeneratorService } from '../../application/services/warmup-generator.service';
import { TrainingSessionPersistenceModule } from '../base/modules/training-session-persistence.module';
import { TrainingController } from './controllers/training.controller';

@Module({
  imports: [TrainingSessionPersistenceModule],
  controllers: [TrainingController],
  providers: [
    TrainingSessionService,
    WarmupGeneratorService,
    AutoregulationService,
    ReadinessService,
  ],
})
export class TrainingModule {}
