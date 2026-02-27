import { Global, Module } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { PASSWORD_HASHER } from '../../application/interfaces/password-hasher.interface';
import { TOKEN_SERVICE } from '../../application/interfaces/token-service.interface';
import { BcryptPasswordHasher } from '../base/auth/bcrypt-password-hasher';
import { JwtTokenService } from '../base/auth/jwt-token.service';
import { PersistenceModule } from '../base/modules/persistence.module';
import { AuthController } from './controllers/auth.controller';

@Global()
@Module({
  imports: [PersistenceModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
  ],
  exports: [TOKEN_SERVICE, PASSWORD_HASHER],
})
export class AuthModule {}
