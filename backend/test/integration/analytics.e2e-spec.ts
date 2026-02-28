import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TOKEN_SERVICE } from '../../src/application/interfaces/token-service.interface';
import { AnalyticsService } from '../../src/application/services/analytics.service';
import { VolumeTrackerService } from '../../src/application/services/volume-tracker.service';
import { MuscleGroup } from '../../src/domain/enums';
import { GlobalExceptionFilter } from '../../src/infrastructure/base/filters/global-exception.filter';
import { PrismaService } from '../../src/infrastructure/secondary-adapters/database/prisma/prisma.service';

describe('Analytics (e2e)', () => {
  let app: INestApplication;

  const volumeTrackerServiceMock: Pick<
    VolumeTrackerService,
    'getWeeklyVolume' | 'getVolumeHistory'
  > = {
    getWeeklyVolume: jest.fn().mockResolvedValue({
      weekOffset: 0,
      weekStart: new Date('2026-02-23T00:00:00.000Z'),
      weekEnd: new Date('2026-03-02T00:00:00.000Z'),
      items: [
        {
          muscleGroup: MuscleGroup.CHEST,
          effectiveSets: 12,
          mev: 8,
          mrv: 22,
          status: 'WITHIN_RANGE',
        },
      ],
    }),
    getVolumeHistory: jest.fn().mockResolvedValue([
      {
        weekOffset: 1,
        weekStart: new Date('2026-02-16T00:00:00.000Z'),
        weekEnd: new Date('2026-02-23T00:00:00.000Z'),
        items: [
          {
            muscleGroup: MuscleGroup.CHEST,
            effectiveSets: 10,
            mev: 8,
            mrv: 22,
            status: 'WITHIN_RANGE',
          },
        ],
      },
    ]),
  };

  const analyticsServiceMock: Pick<AnalyticsService, 'checkDeload'> = {
    checkDeload: jest.fn().mockResolvedValue({
      needsDeload: false,
      reasons: [],
      affectedMuscles: [],
      readinessAverageLast14Days: 3.4,
    }),
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
      .overrideProvider(VolumeTrackerService)
      .useValue(volumeTrackerServiceMock)
      .overrideProvider(AnalyticsService)
      .useValue(analyticsServiceMock)
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

  it('GET /api/v1/analytics/volume/weekly returns weekly volume', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/analytics/volume/weekly?weekOffset=0')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          weekOffset: number;
          items: Array<{ muscleGroup: MuscleGroup }>;
        };

        expect(body.weekOffset).toBe(0);
        expect(body.items[0]?.muscleGroup).toBe(MuscleGroup.CHEST);
      });
  });

  it('GET /api/v1/analytics/volume/history returns weekly history', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/analytics/volume/history?weeks=6')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          weeks: Array<{ weekOffset: number }>;
        };

        expect(body.weeks).toHaveLength(1);
      });
  });

  it('GET /api/v1/analytics/deload/check returns deload recommendation', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/analytics/deload/check')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as { needsDeload: boolean };
        expect(body.needsDeload).toBe(false);
      });
  });
});
