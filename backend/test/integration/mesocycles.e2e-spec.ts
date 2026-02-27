import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import request, { type Response as SupertestResponse } from 'supertest';
import { AppModule } from '../../src/app.module';
import { MesocycleService } from '../../src/application/services/mesocycle.service';
import { TOKEN_SERVICE } from '../../src/application/interfaces/token-service.interface';
import { MesocycleEntity } from '../../src/domain/entities/mesocycle.entity';
import { PlannedExerciseEntity } from '../../src/domain/entities/planned-exercise.entity';
import { TrainingDayEntity } from '../../src/domain/entities/training-day.entity';
import { MesocycleStatus, TrainingObjective } from '../../src/domain/enums';
import { EntityNotFoundError } from '../../src/domain/errors/entity-not-found.error';
import { ValidationError } from '../../src/domain/errors/validation.error';
import { GlobalExceptionFilter } from '../../src/infrastructure/base/filters/global-exception.filter';
import { PrismaService } from '../../src/infrastructure/secondary-adapters/database/prisma/prisma.service';

describe('Mesocycles (e2e)', () => {
  let app: INestApplication;

  const now = new Date('2026-02-27T10:00:00.000Z');

  const buildMesocycle = (
    id: string,
    status: MesocycleStatus,
    name = 'Mesociclo base',
  ): MesocycleEntity =>
    new MesocycleEntity({
      id,
      userId: 'user-1',
      name,
      description: 'Plan base',
      durationWeeks: 8,
      objective: TrainingObjective.HYPERTROPHY,
      includeDeload: true,
      status,
      startedAt: status === MesocycleStatus.ACTIVE ? now : null,
      completedAt: null,
      deletedAt: null,
      trainingDays: [
        new TrainingDayEntity({
          id: `${id}-day-1`,
          mesocycleId: id,
          name: 'Upper A',
          dayOrder: 1,
          plannedExercises: [
            new PlannedExerciseEntity({
              id: `${id}-planned-1`,
              trainingDayId: `${id}-day-1`,
              exerciseId: 'exercise-1',
              exerciseOrder: 1,
              targetSets: 3,
              targetRepsMin: 8,
              targetRepsMax: 10,
              targetRir: 2,
              tempo: null,
              supersetGroup: null,
              setupNotes: null,
              createdAt: now,
              updatedAt: now,
            }),
          ],
          createdAt: now,
          updatedAt: now,
        }),
      ],
      createdAt: now,
      updatedAt: now,
    });

  const store = new Map<string, MesocycleEntity>([
    ['active-1', buildMesocycle('active-1', MesocycleStatus.ACTIVE, 'Activo')],
    ['draft-1', buildMesocycle('draft-1', MesocycleStatus.DRAFT, 'Borrador')],
  ]);

  const mesocycleServiceMock: Pick<
    MesocycleService,
    | 'listMesocycles'
    | 'getMesocycleDetail'
    | 'createMesocycle'
    | 'updateMesocycle'
    | 'deleteMesocycle'
    | 'duplicateMesocycle'
    | 'activateMesocycle'
    | 'completeMesocycle'
  > = {
    listMesocycles: jest.fn().mockImplementation(() => {
      const data = [...store.values()];
      return Promise.resolve({
        data,
        total: data.length,
        page: 1,
        limit: 20,
      });
    }),
    getMesocycleDetail: jest
      .fn()
      .mockImplementation((_userId: string, id: string) => {
        const mesocycle = store.get(id);
        if (mesocycle === undefined) {
          throw new EntityNotFoundError('Mesocycle', id);
        }

        return Promise.resolve(mesocycle);
      }),
    createMesocycle: jest.fn().mockImplementation(() => {
      const created = buildMesocycle(
        'created-1',
        MesocycleStatus.DRAFT,
        'Nuevo mesociclo',
      );
      store.set(created.id, created);
      return Promise.resolve(created);
    }),
    updateMesocycle: jest
      .fn()
      .mockImplementation((_userId: string, id: string) => {
        const current = store.get(id);
        if (current === undefined) {
          throw new EntityNotFoundError('Mesocycle', id);
        }

        if (!current.isDraft()) {
          throw new ValidationError('Only DRAFT mesocycles can be updated');
        }

        const updated = buildMesocycle(
          id,
          MesocycleStatus.DRAFT,
          'Actualizado',
        );
        store.set(id, updated);
        return Promise.resolve(updated);
      }),
    deleteMesocycle: jest
      .fn()
      .mockImplementation((_userId: string, id: string) => {
        store.delete(id);
        return Promise.resolve();
      }),
    duplicateMesocycle: jest
      .fn()
      .mockImplementation((_userId: string, id: string) => {
        const current = store.get(id);
        if (current === undefined) {
          throw new EntityNotFoundError('Mesocycle', id);
        }

        const duplicate = buildMesocycle(
          `${id}-copy`,
          MesocycleStatus.DRAFT,
          `${current.name} (Copia)`,
        );
        store.set(duplicate.id, duplicate);
        return Promise.resolve(duplicate);
      }),
    activateMesocycle: jest
      .fn()
      .mockImplementation((_userId: string, id: string) => {
        const current = store.get(id);
        if (current === undefined) {
          throw new EntityNotFoundError('Mesocycle', id);
        }

        if (!current.isDraft()) {
          throw new ValidationError('Only DRAFT mesocycles can be activated');
        }

        for (const mesocycle of [...store.values()]) {
          if (mesocycle.isActive()) {
            store.set(
              mesocycle.id,
              buildMesocycle(
                mesocycle.id,
                MesocycleStatus.ARCHIVED,
                mesocycle.name,
              ),
            );
          }
        }

        store.set(id, buildMesocycle(id, MesocycleStatus.ACTIVE, current.name));
        return Promise.resolve();
      }),
    completeMesocycle: jest.fn().mockResolvedValue(undefined),
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
      .overrideProvider(MesocycleService)
      .useValue(mesocycleServiceMock)
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

  it('GET /api/v1/mesocycles returns paginated list', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/mesocycles?page=1&limit=20')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response: SupertestResponse) => {
        const body = response.body as {
          data: Array<{ id: string }>;
          meta: { total: number; page: number; limit: number };
        };

        expect(body.data.length).toBeGreaterThanOrEqual(2);
        expect(body.meta.total).toBeGreaterThanOrEqual(2);
      });
  });

  it('POST /api/v1/mesocycles creates a draft mesocycle', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/mesocycles')
      .set('Authorization', 'Bearer valid-token')
      .send({
        name: 'Nuevo mesociclo',
        description: 'Plan de volumen',
        durationWeeks: 8,
        objective: 'HYPERTROPHY',
        includeDeload: true,
        trainingDays: [
          {
            name: 'Upper A',
            dayOrder: 1,
            plannedExercises: [
              {
                exerciseId: 'exercise-1',
                exerciseOrder: 1,
                targetSets: 3,
                targetRepsMin: 8,
                targetRepsMax: 10,
                targetRir: 2,
              },
            ],
          },
        ],
      })
      .expect(201)
      .expect((response: SupertestResponse) => {
        const body = response.body as { id: string; status: MesocycleStatus };
        expect(body.id).toBe('created-1');
        expect(body.status).toBe(MesocycleStatus.DRAFT);
      });
  });

  it('POST /api/v1/mesocycles/:id/activate archives previous active mesocycle', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/mesocycles/draft-1/activate')
      .set('Authorization', 'Bearer valid-token')
      .expect(204);

    await request(httpServer)
      .get('/api/v1/mesocycles')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response: SupertestResponse) => {
        const body = response.body as {
          data: Array<{ id: string; status: MesocycleStatus }>;
        };

        const archivedPrevious = body.data.find(
          (item) => item.id === 'active-1',
        );
        const activatedCurrent = body.data.find(
          (item) => item.id === 'draft-1',
        );

        expect(archivedPrevious?.status).toBe(MesocycleStatus.ARCHIVED);
        expect(activatedCurrent?.status).toBe(MesocycleStatus.ACTIVE);
      });
  });

  it('POST /api/v1/mesocycles/:id/duplicate creates a draft copy with new id', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/mesocycles/draft-1/duplicate')
      .set('Authorization', 'Bearer valid-token')
      .expect(201)
      .expect((response: SupertestResponse) => {
        const body = response.body as { id: string; status: MesocycleStatus };

        expect(body.id).toBe('draft-1-copy');
        expect(body.id).not.toBe('draft-1');
        expect(body.status).toBe(MesocycleStatus.DRAFT);
      });
  });

  it('DELETE /api/v1/mesocycles/:id returns 204', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .delete('/api/v1/mesocycles/created-1')
      .set('Authorization', 'Bearer valid-token')
      .expect(204);
  });
});
