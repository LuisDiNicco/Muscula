import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TOKEN_SERVICE } from '../../src/application/interfaces/token-service.interface';
import {
  AnalyticsService,
  type CorrelationResult,
} from '../../src/application/services/analytics.service';
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

  const analyticsServiceMock: Pick<
    AnalyticsService,
    | 'checkDeload'
    | 'getMuscleHeatmap'
    | 'getStrengthTrend'
    | 'getTonnageTrend'
    | 'getPersonalRecords'
    | 'getCorrelations'
  > = {
    checkDeload: jest.fn().mockResolvedValue({
      needsDeload: false,
      reasons: [],
      affectedMuscles: [],
      readinessAverageLast14Days: 3.4,
    }),
    getMuscleHeatmap: jest.fn().mockResolvedValue([
      {
        muscleGroup: MuscleGroup.CHEST,
        lastTrainedAt: new Date('2026-02-28T00:00:00.000Z'),
        effectiveSetsThisWeek: 10,
        recovery: 'RECENT',
      },
    ]),
    getStrengthTrend: jest.fn().mockResolvedValue([
      {
        date: new Date('2026-02-28T00:00:00.000Z'),
        estimatedOneRm: 132.5,
      },
    ]),
    getTonnageTrend: jest.fn().mockResolvedValue([
      {
        date: new Date('2026-02-28T00:00:00.000Z'),
        tonnage: 4200,
      },
    ]),
    getPersonalRecords: jest.fn().mockResolvedValue({
      exerciseId: 'exercise-1',
      period: 'all',
      bestOneRm: 145,
      bestSet: {
        sessionId: 'session-1',
        date: new Date('2026-02-28T00:00:00.000Z'),
        weightKg: 120,
        reps: 8,
        rir: 1,
      },
      bestVolumeSession: {
        sessionId: 'session-2',
        date: new Date('2026-02-27T00:00:00.000Z'),
        tonnage: 5100,
      },
    }),
    getCorrelations: jest.fn().mockResolvedValue({
      type: 'WEEKLY_VOLUME_VS_READINESS',
      points: [
        {
          x: 52,
          y: 3.4,
          date: new Date('2026-02-24T00:00:00.000Z'),
        },
      ],
    } satisfies CorrelationResult),
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

  it('GET /api/v1/analytics/heatmap returns heatmap list', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/analytics/heatmap')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          items: Array<{ muscleGroup: MuscleGroup; recovery: string }>;
        };

        expect(body.items[0]?.muscleGroup).toBe(MuscleGroup.CHEST);
        expect(body.items[0]?.recovery).toBe('RECENT');
      });
  });

  it('GET /api/v1/analytics/strength returns strength trend', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/analytics/strength?exerciseId=exercise-1&period=90d')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          points: Array<{ estimatedOneRm: number }>;
        };

        expect(body.points[0]?.estimatedOneRm).toBe(132.5);
      });
  });

  it('GET /api/v1/analytics/strength validates required query params', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/analytics/strength')
      .set('Authorization', 'Bearer valid-token')
      .expect(400);
  });

  it('GET /api/v1/analytics/tonnage returns tonnage trend', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/analytics/tonnage?exerciseId=exercise-1&period=90d')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          points: Array<{ tonnage: number }>;
        };

        expect(body.points[0]?.tonnage).toBe(4200);
      });
  });

  it('GET /api/v1/analytics/prs returns personal records', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/analytics/prs?exerciseId=exercise-1&period=all')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as { bestOneRm: number };
        expect(body.bestOneRm).toBe(145);
      });
  });

  it('GET /api/v1/analytics/correlations returns correlation points', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get(
        '/api/v1/analytics/correlations?type=WEEKLY_VOLUME_VS_READINESS&period=90d',
      )
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          type: string;
          points: Array<{ x: number; y: number }>;
        };

        expect(body.type).toBe('WEEKLY_VOLUME_VS_READINESS');
        expect(body.points[0]?.x).toBe(52);
      });
  });
});
