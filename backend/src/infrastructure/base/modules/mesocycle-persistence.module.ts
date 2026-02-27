import { Module } from '@nestjs/common';
import { MESOCYCLE_REPOSITORY } from '../../../application/interfaces/mesocycle-repository.interface';
import { PrismaMesocycleRepository } from '../../secondary-adapters/database/mesocycle/prisma-mesocycle.repository';

@Module({
  providers: [
    {
      provide: MESOCYCLE_REPOSITORY,
      useClass: PrismaMesocycleRepository,
    },
  ],
  exports: [MESOCYCLE_REPOSITORY],
})
export class MesocyclePersistenceModule {}
