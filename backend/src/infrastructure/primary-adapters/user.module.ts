import { Module } from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { AuthModule } from './auth.module';
import { PersistenceModule } from '../base/modules/persistence.module';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [AuthModule, PersistenceModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
