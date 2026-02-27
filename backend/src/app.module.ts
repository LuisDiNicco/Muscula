import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { appConfig } from './infrastructure/base/config/app.config';
import { databaseConfig } from './infrastructure/base/config/database.config';
import { jwtConfig } from './infrastructure/base/config/jwt.config';
import { HealthController } from './infrastructure/primary-adapters/controllers/health.controller';
import { PrismaModule } from './infrastructure/secondary-adapters/database/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TerminusModule,
    PrismaModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
