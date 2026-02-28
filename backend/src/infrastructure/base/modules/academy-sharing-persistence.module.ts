import { Module } from '@nestjs/common';
import { ARTICLE_REPOSITORY } from '../../../application/interfaces/article-repository.interface';
import { ROUTINE_SHARING_REPOSITORY } from '../../../application/interfaces/routine-sharing-repository.interface';
import { PrismaArticleRepository } from '../../secondary-adapters/database/academy/prisma-article.repository';
import { PrismaRoutineSharingRepository } from '../../secondary-adapters/database/sharing/prisma-routine-sharing.repository';

@Module({
  providers: [
    {
      provide: ARTICLE_REPOSITORY,
      useClass: PrismaArticleRepository,
    },
    {
      provide: ROUTINE_SHARING_REPOSITORY,
      useClass: PrismaRoutineSharingRepository,
    },
  ],
  exports: [ARTICLE_REPOSITORY, ROUTINE_SHARING_REPOSITORY],
})
export class AcademySharingPersistenceModule {}
