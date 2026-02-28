import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TOKEN_SERVICE } from '../../src/application/interfaces/token-service.interface';
import { AchievementService } from '../../src/application/services/achievement.service';
import { GlobalExceptionFilter } from '../../src/infrastructure/base/filters/global-exception.filter';
import { PrismaService } from '../../src/infrastructure/secondary-adapters/database/prisma/prisma.service';

describe('Achievements (e2e)', () => {
  let app: INestApplication;

  const achievementServiceMock: Pick<AchievementService, 'getAchievements'> = {
    getAchievements: jest.fn().mockResolvedValue([
      {
        id: 'achievement-1',
        code: 'FIRST_SESSION',
        titleEs: 'Primera sesión registrada',
        titleEn: 'First Session Logged',
        descriptionEs: 'Completaste y registraste tu primera sesión.',
        descriptionEn: 'You completed your first session.',
        iconUrl: 'https://assets.muscula.app/achievements/first-session.svg',
        condition: 'Registrar 1 sesión',
        unlockedAt: new Date('2026-02-28T00:00:00.000Z'),
      },
      {
        id: 'achievement-2',
        code: 'STREAK_7',
        titleEs: '7 días consecutivos',
        titleEn: '7-day Streak',
        descriptionEs: 'Entrenaste 7 días seguidos.',
        descriptionEn: 'You trained 7 consecutive days.',
        iconUrl: 'https://assets.muscula.app/achievements/streak-7.svg',
        condition: 'Entrenar 7 días consecutivos',
        unlockedAt: null,
      },
    ]),
  };

  const tokenServiceMock = {
    verifyAccessToken: jest.fn().mockResolvedValue({
      sub: 'user-1',
      email: 'luis@example.com',
    }),
  };

  beforeAll(async () => {
    const prismaServiceMock: Pick<
      PrismaService,
      '$connect' | '$disconnect' | '$queryRaw'
    > = {
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
      $queryRaw: jest.fn().mockResolvedValue(1),
    };

    const prismaHealthIndicatorMock: Pick<PrismaHealthIndicator, 'pingCheck'> =
      {
        pingCheck: jest.fn().mockResolvedValue({
          database: {
            status: 'up',
          },
        }),
      };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideProvider(PrismaHealthIndicator)
      .useValue(prismaHealthIndicatorMock)
      .overrideProvider(AchievementService)
      .useValue(achievementServiceMock)
      .overrideProvider(TOKEN_SERVICE)
      .useValue(tokenServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/achievements returns list with unlocked status', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/achievements')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as Array<{
          code: string;
          unlocked: boolean;
          unlockedAt: string | null;
        }>;

        expect(body).toHaveLength(2);
        expect(body[0]?.code).toBe('FIRST_SESSION');
        expect(body[0]?.unlocked).toBe(true);
        expect(body[1]?.unlocked).toBe(false);
      });
  });

  it('GET /api/v1/achievements requires authentication', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    await request(httpServer).get('/api/v1/achievements').expect(401);
  });
});
