import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import request, { type Response as SupertestResponse } from 'supertest';
import { AppModule } from '../../src/app.module';
import { ReadinessService } from '../../src/application/services/readiness.service';
import { TrainingSessionService } from '../../src/application/services/training-session.service';
import { TOKEN_SERVICE } from '../../src/application/interfaces/token-service.interface';
import type { SessionDetail } from '../../src/application/interfaces/training-session-repository.interface';
import { SessionEntity } from '../../src/domain/entities/session.entity';
import { SessionStatus } from '../../src/domain/enums';
import { GlobalExceptionFilter } from '../../src/infrastructure/base/filters/global-exception.filter';
import { PrismaService } from '../../src/infrastructure/secondary-adapters/database/prisma/prisma.service';

describe('Training Sessions (e2e)', () => {
  let app: INestApplication;

  const now = new Date('2026-02-27T10:00:00.000Z');

  const buildSession = (
    id: string,
    status: SessionStatus = SessionStatus.IN_PROGRESS,
  ): SessionEntity =>
    new SessionEntity({
      id,
      userId: 'user-1',
      mesocycleId: 'meso-1',
      trainingDayId: 'day-1',
      weekNumber: 1,
      status,
      startedAt: now,
      finishedAt: status === SessionStatus.IN_PROGRESS ? null : now,
      durationMinutes: status === SessionStatus.IN_PROGRESS ? null : 55,
      sessionNotes: status === SessionStatus.COMPLETED ? 'Good session' : null,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });

  let activeSession: SessionEntity | null = buildSession('session-1');

  const trainingSessionServiceMock: Pick<
    TrainingSessionService,
    | 'startSession'
    | 'getActiveSession'
    | 'listSessions'
    | 'getSessionDetail'
    | 'addExerciseToSession'
    | 'removeExerciseFromSession'
    | 'addSet'
    | 'updateSet'
    | 'deleteSet'
    | 'completeSession'
    | 'abandonSession'
  > = {
    startSession: jest.fn().mockImplementation(() => {
      activeSession = buildSession('session-2');
      return Promise.resolve(activeSession);
    }),
    getActiveSession: jest.fn().mockImplementation(() => {
      return Promise.resolve(activeSession);
    }),
    listSessions: jest.fn().mockImplementation(() => {
      const completed = buildSession('session-3', SessionStatus.COMPLETED);
      const data = [buildSession('session-1'), completed];
      return Promise.resolve({
        data,
        total: data.length,
        page: 1,
        limit: 20,
      });
    }),
    getSessionDetail: jest.fn().mockImplementation(() => {
      const detail: SessionDetail = {
        session: buildSession('session-1'),
        readiness: {
          sleepScore: 4,
          stressScore: 3,
          domsScore: 4,
          totalScore: 11,
        },
        exercises: [
          {
            id: 'session-ex-1',
            exerciseId: 'exercise-1',
            exerciseOrder: 1,
            originalExerciseId: null,
            sets: [
              {
                id: 'set-1',
                setOrder: 1,
                weightKg: 100,
                reps: 8,
                rir: 2,
                restTimeSec: 180,
                notes: null,
                completed: true,
                skipped: false,
              },
            ],
            warmups: [
              {
                id: 'warmup-1',
                setOrder: 1,
                weightKg: 60,
                reps: 5,
                completed: true,
              },
            ],
          },
        ],
      };

      return Promise.resolve(detail);
    }),
    addExerciseToSession: jest.fn().mockResolvedValue(undefined),
    removeExerciseFromSession: jest.fn().mockResolvedValue(undefined),
    addSet: jest.fn().mockResolvedValue(undefined),
    updateSet: jest.fn().mockResolvedValue(undefined),
    deleteSet: jest.fn().mockResolvedValue(undefined),
    completeSession: jest.fn().mockImplementation(() => {
      activeSession = null;
      return Promise.resolve(undefined);
    }),
    abandonSession: jest.fn().mockImplementation(() => {
      activeSession = null;
      return Promise.resolve(undefined);
    }),
  };

  const readinessServiceMock: Pick<ReadinessService, 'recordReadiness'> = {
    recordReadiness: jest.fn().mockResolvedValue({ totalScore: 11 }),
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
      .overrideProvider(TrainingSessionService)
      .useValue(trainingSessionServiceMock)
      .overrideProvider(ReadinessService)
      .useValue(readinessServiceMock)
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

  it('POST /api/v1/training/sessions starts a session', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/training/sessions')
      .set('Authorization', 'Bearer valid-token')
      .send({
        mesocycleId: 'a21265b2-9760-4804-a7ce-ea03f91ef53e',
        trainingDayId: 'b3649bb3-e592-4f9e-bde2-2ce3ff6ddf3c',
        weekNumber: 1,
      })
      .expect(201)
      .expect((response: SupertestResponse) => {
        const body = response.body as { id: string; status: SessionStatus };
        expect(body.id).toBe('session-2');
        expect(body.status).toBe(SessionStatus.IN_PROGRESS);
      });
  });

  it('GET /api/v1/training/sessions/active returns active session', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/training/sessions/active')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response: SupertestResponse) => {
        const body = response.body as { id: string; status: SessionStatus };
        expect(body.id).toBe('session-2');
        expect(body.status).toBe(SessionStatus.IN_PROGRESS);
      });
  });

  it('GET /api/v1/training/sessions returns paginated sessions', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/training/sessions?page=1&limit=20')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response: SupertestResponse) => {
        const body = response.body as {
          data: Array<{ id: string }>;
          meta: { total: number; page: number; limit: number };
        };

        expect(body.data).toHaveLength(2);
        expect(body.meta.total).toBe(2);
      });
  });

  it('GET /api/v1/training/sessions/:id returns session detail', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/training/sessions/session-1')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response: SupertestResponse) => {
        const body = response.body as {
          id: string;
          exercises: Array<{ id: string }>;
          readiness: { totalScore: number };
        };

        expect(body.id).toBe('session-1');
        expect(body.exercises[0]?.id).toBe('session-ex-1');
        expect(body.readiness.totalScore).toBe(11);
      });
  });

  it('POST /api/v1/training/sessions/:id/readiness records readiness', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/training/sessions/session-1/readiness')
      .set('Authorization', 'Bearer valid-token')
      .send({
        sleepScore: 4,
        stressScore: 3,
        domsScore: 4,
      })
      .expect(201)
      .expect((response: SupertestResponse) => {
        const body = response.body as { totalScore: number };
        expect(body.totalScore).toBe(11);
      });
  });

  it('POST /api/v1/training/sessions/:id/complete completes session', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/training/sessions/session-2/complete')
      .set('Authorization', 'Bearer valid-token')
      .send({ notes: 'Solid training' })
      .expect(204);

    await request(httpServer)
      .get('/api/v1/training/sessions/active')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response: SupertestResponse) => {
        const body = response.body as Record<string, never>;
        expect(body).toEqual({});
      });
  });

  it('GET /api/v1/training/sessions/active returns 401 without token', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/training/sessions/active')
      .expect(401);
  });
});
