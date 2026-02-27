import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import request, { type Response as SupertestResponse } from 'supertest';
import { AppModule } from '../../src/app.module';
import { ExerciseService } from '../../src/application/services/exercise.service';
import { TOKEN_SERVICE } from '../../src/application/interfaces/token-service.interface';
import { EntityNotFoundError } from '../../src/domain/errors/entity-not-found.error';
import { ExerciseEntity } from '../../src/domain/entities/exercise.entity';
import {
  DifficultyLevel,
  EquipmentType,
  MovementPattern,
  MuscleGroup,
} from '../../src/domain/enums';
import { GlobalExceptionFilter } from '../../src/infrastructure/base/filters/global-exception.filter';
import { PrismaService } from '../../src/infrastructure/secondary-adapters/database/prisma/prisma.service';

describe('Exercises (e2e)', () => {
  let app: INestApplication;

  const now = new Date('2026-02-27T10:00:00.000Z');

  const buildExercise = (id = 'exercise-1'): ExerciseEntity =>
    new ExerciseEntity({
      id,
      nameEs: 'Press banca con barra (plano)',
      nameEn: 'Barbell Bench Press (Flat)',
      movementPattern: MovementPattern.HORIZONTAL_PUSH,
      difficulty: DifficultyLevel.INTERMEDIATE,
      equipmentType: EquipmentType.BARBELL,
      isCompound: true,
      primaryMuscles: [MuscleGroup.CHEST],
      secondaryMuscles: [MuscleGroup.TRICEPS],
      createdAt: now,
      updatedAt: now,
    });

  const exerciseServiceMock: Pick<
    ExerciseService,
    | 'listExercises'
    | 'getExerciseDetail'
    | 'getSubstitutes'
    | 'createCustomExercise'
  > = {
    listExercises: jest.fn().mockResolvedValue({
      data: [buildExercise()],
      total: 1,
      page: 1,
      limit: 20,
    }),
    getExerciseDetail: jest.fn().mockImplementation((id: string) => {
      if (id === 'missing-id') {
        throw new EntityNotFoundError('Exercise', id);
      }

      return buildExercise(id);
    }),
    getSubstitutes: jest.fn().mockResolvedValue([buildExercise('sub-1')]),
    createCustomExercise: jest
      .fn()
      .mockResolvedValue(buildExercise('custom-1')),
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
      .overrideProvider(ExerciseService)
      .useValue(exerciseServiceMock)
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

  it('GET /api/v1/exercises returns paginated list', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/exercises?page=1&limit=20')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response: SupertestResponse) => {
        const body = response.body as {
          data: Array<{ id: string }>;
          meta: { total: number; page: number; limit: number };
        };

        expect(body.data).toHaveLength(1);
        expect(body.data[0].id).toBe('exercise-1');
        expect(body.meta.total).toBe(1);
      });
  });

  it('GET /api/v1/exercises/:id returns 404 when exercise does not exist', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/exercises/missing-id')
      .set('Authorization', 'Bearer valid-token')
      .expect(404);
  });

  it('POST /api/v1/exercises creates custom exercise when authenticated', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/exercises')
      .set('Authorization', 'Bearer valid-token')
      .send({
        nameEs: 'Press con mancuernas neutral',
        nameEn: 'Neutral Grip Dumbbell Press',
        movementPattern: 'HORIZONTAL_PUSH',
        difficulty: 'BEGINNER',
        equipmentType: 'DUMBBELL',
        isCompound: true,
        primaryMuscles: ['CHEST'],
        secondaryMuscles: ['TRICEPS'],
      })
      .expect(201)
      .expect((response: SupertestResponse) => {
        const body = response.body as { id: string };
        expect(body.id).toBe('custom-1');
      });
  });
});
