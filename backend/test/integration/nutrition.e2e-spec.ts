import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import request, { type Response as SupertestResponse } from 'supertest';
import { TOKEN_SERVICE } from '../../src/application/interfaces/token-service.interface';
import { BodyMetricService } from '../../src/application/services/body-metric.service';
import { NutritionService } from '../../src/application/services/nutrition.service';
import { AppModule } from '../../src/app.module';
import { BodyMode, MealType } from '../../src/domain/enums';
import { PrismaService } from '../../src/infrastructure/secondary-adapters/database/prisma/prisma.service';

describe('Nutrition (e2e)', () => {
  let app: INestApplication;

  const nutritionServiceMock: Pick<
    NutritionService,
    | 'getDailyNutrition'
    | 'ensureMeal'
    | 'addFoodEntry'
    | 'deleteFoodEntry'
    | 'searchFoods'
    | 'searchFoodByBarcode'
    | 'createCustomFood'
    | 'getBodyMode'
    | 'setBodyMode'
  > = {
    getDailyNutrition: jest.fn().mockResolvedValue({
      date: new Date('2026-02-28T00:00:00.000Z'),
      bodyMode: BodyMode.MAINTENANCE,
      meals: [],
      totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      targets: { calories: 2500, protein: 160, carbs: 280, fat: 70 },
      tdee: 2500,
    }),
    ensureMeal: jest.fn().mockResolvedValue({ mealId: 'meal-1' }),
    addFoodEntry: jest.fn().mockResolvedValue(undefined),
    deleteFoodEntry: jest.fn().mockResolvedValue(undefined),
    searchFoods: jest.fn().mockResolvedValue({
      data: [{ id: 'food-1', name: 'Rice', brand: null }],
      total: 1,
    }),
    searchFoodByBarcode: jest
      .fn()
      .mockResolvedValue({ id: 'food-1', name: 'Rice', brand: null }),
    createCustomFood: jest
      .fn()
      .mockResolvedValue({ id: 'food-2', name: 'Oats' }),
    getBodyMode: jest.fn().mockResolvedValue(BodyMode.MAINTENANCE),
    setBodyMode: jest.fn().mockResolvedValue({
      mode: BodyMode.CUT,
      targets: { calories: 2200, protein: 180, carbs: 200, fat: 61 },
    }),
  };

  const bodyMetricServiceMock: Pick<
    BodyMetricService,
    'recordMetrics' | 'getMetrics' | 'getWeightTrend'
  > = {
    recordMetrics: jest.fn().mockResolvedValue(undefined),
    getMetrics: jest
      .fn()
      .mockResolvedValue([
        { date: new Date('2026-02-28T00:00:00.000Z'), weightKg: 80 },
      ]),
    getWeightTrend: jest.fn().mockResolvedValue([
      {
        date: new Date('2026-02-28T00:00:00.000Z'),
        weightKg: 80,
        movingAverage7d: 79.6,
      },
    ]),
  };

  const tokenServiceMock = {
    verifyAccessToken: jest.fn().mockResolvedValue({
      sub: 'user-1',
      email: 'user@test.com',
      username: 'user1',
      roles: ['USER'],
      iat: 0,
      exp: 0,
    }),
    signAccessToken: jest.fn(),
    signRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const prismaServiceMock: Pick<
    PrismaService,
    '$connect' | '$disconnect' | '$queryRaw'
  > = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $queryRaw: jest.fn().mockResolvedValue(1),
  };

  const prismaHealthIndicatorMock: Pick<PrismaHealthIndicator, 'pingCheck'> = {
    pingCheck: jest.fn().mockResolvedValue({
      database: {
        status: 'up',
      },
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(NutritionService)
      .useValue(nutritionServiceMock)
      .overrideProvider(BodyMetricService)
      .useValue(bodyMetricServiceMock)
      .overrideProvider(TOKEN_SERVICE)
      .useValue(tokenServiceMock)
      .overrideProvider(PrismaService)
      .useValue(prismaServiceMock)
      .overrideProvider(PrismaHealthIndicator)
      .useValue(prismaHealthIndicatorMock)
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
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/nutrition/daily returns daily summary', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/nutrition/daily?date=2026-02-28')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response: SupertestResponse) => {
        expect(response.body).toHaveProperty('bodyMode', 'MAINTENANCE');
      });
  });

  it('POST /api/v1/nutrition/meals returns created meal id', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/nutrition/meals')
      .set('Authorization', 'Bearer valid-token')
      .send({ date: '2026-02-28', mealType: MealType.LUNCH })
      .expect(201)
      .expect((response: SupertestResponse) => {
        expect(response.body).toHaveProperty('mealId', 'meal-1');
      });
  });

  it('POST /api/v1/nutrition/meals/:mealId/entries returns 204', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/nutrition/meals/meal-1/entries')
      .set('Authorization', 'Bearer valid-token')
      .send({ foodId: '0f98e1a8-b3d5-4f17-a4cc-4ff5ec2c4ab3', grams: 120 })
      .expect(204);
  });

  it('GET /api/v1/body-metrics/weight-trend returns trend points', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/body-metrics/weight-trend?days=30')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response: SupertestResponse) => {
        const body = response.body as Array<{ movingAverage7d: number }>;
        expect(body).toHaveLength(1);
        expect(body[0]?.movingAverage7d).toBe(79.6);
      });
  });
});
