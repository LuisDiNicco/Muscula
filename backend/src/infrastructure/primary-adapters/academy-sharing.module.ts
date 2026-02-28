import { Module } from '@nestjs/common';
import { ArticleService } from '../../application/services/article.service';
import { RoutineSharingService } from '../../application/services/routine-sharing.service';
import { AcademySharingPersistenceModule } from '../base/modules/academy-sharing-persistence.module';
import { AcademyController } from './controllers/academy.controller';
import { RoutineSharingController } from './controllers/routine-sharing.controller';

@Module({
  imports: [AcademySharingPersistenceModule],
  controllers: [AcademyController, RoutineSharingController],
  providers: [ArticleService, RoutineSharingService],
})
export class AcademySharingModule {}
