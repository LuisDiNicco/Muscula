import { Module } from '@nestjs/common';
import { REFRESH_TOKEN_REPOSITORY } from '../../../application/interfaces/refresh-token-repository.interface';
import { USER_REPOSITORY } from '../../../application/interfaces/user-repository.interface';
import { PrismaRefreshTokenRepository } from '../../secondary-adapters/database/auth/prisma-refresh-token.repository';
import { PrismaUserRepository } from '../../secondary-adapters/database/user/prisma-user.repository';

@Module({
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: PrismaRefreshTokenRepository,
    },
  ],
  exports: [USER_REPOSITORY, REFRESH_TOKEN_REPOSITORY],
})
export class PersistenceModule {}
