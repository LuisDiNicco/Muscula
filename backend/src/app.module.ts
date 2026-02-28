import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { appConfig } from './infrastructure/base/config/app.config';
import { databaseConfig } from './infrastructure/base/config/database.config';
import { jwtConfig } from './infrastructure/base/config/jwt.config';
import { HealthController } from './infrastructure/base/controllers/health.controller';
import { JwtAuthGuard } from './infrastructure/primary-adapters/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/primary-adapters/guards/roles.guard';
import { AuthModule } from './infrastructure/primary-adapters/auth.module';
import { UserModule } from './infrastructure/primary-adapters/user.module';
import { ExerciseModule } from './infrastructure/primary-adapters/exercise.module';
import { MesocycleModule } from './infrastructure/primary-adapters/mesocycle.module';
import { NutritionModule } from './infrastructure/primary-adapters/nutrition.module';
import { AnalyticsModule } from './infrastructure/primary-adapters/analytics.module';
import { TrainingModule } from './infrastructure/primary-adapters/training.module';
import { AcademySharingModule } from './infrastructure/primary-adapters/academy-sharing.module';
import { AchievementModule } from './infrastructure/primary-adapters/achievement.module';
import { ImportExportModule } from './infrastructure/primary-adapters/import-export.module';
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
    AuthModule,
    UserModule,
    ExerciseModule,
    MesocycleModule,
    TrainingModule,
    NutritionModule,
    AnalyticsModule,
    AcademySharingModule,
    AchievementModule,
    ImportExportModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
