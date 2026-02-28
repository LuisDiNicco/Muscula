import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TOKEN_SERVICE } from '../../src/application/interfaces/token-service.interface';
import { ArticleService } from '../../src/application/services/article.service';
import { RoutineSharingService } from '../../src/application/services/routine-sharing.service';
import { ArticleCategory, TrainingObjective } from '../../src/domain/enums';
import { GlobalExceptionFilter } from '../../src/infrastructure/base/filters/global-exception.filter';
import { PrismaService } from '../../src/infrastructure/secondary-adapters/database/prisma/prisma.service';

describe('Academy & Sharing (e2e)', () => {
  let app: INestApplication;

  const articleServiceMock: Pick<
    ArticleService,
    'listArticles' | 'getArticleDetail'
  > = {
    listArticles: jest.fn().mockImplementation(() =>
      Promise.resolve({
        data: [
          {
            id: 'article-1',
            titleEs: '¿Qué es el RIR y cómo usarlo?',
            titleEn: 'What Is RIR and How to Use It?',
            summaryEs: 'Resumen',
            summaryEn: 'Summary',
            category: ArticleCategory.FUNDAMENTALS,
            readTimeMin: 7,
            publishedAt: new Date('2026-02-28T00:00:00.000Z'),
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      }),
    ),
    getArticleDetail: jest.fn().mockImplementation(() =>
      Promise.resolve({
        id: 'article-1',
        titleEs: '¿Qué es el RIR y cómo usarlo?',
        titleEn: 'What Is RIR and How to Use It?',
        summaryEs: 'Resumen',
        summaryEn: 'Summary',
        contentEs: 'Contenido',
        contentEn: 'Content',
        category: ArticleCategory.FUNDAMENTALS,
        readTimeMin: 7,
        publishedAt: new Date('2026-02-28T00:00:00.000Z'),
        references: [
          {
            id: 'ref-1',
            doi: '10.1519/JSC.0000000000001245',
            title: 'RPE and Repetitions in Reserve',
            authors: 'Helms et al.',
            journal: 'JSCR',
            year: 2016,
            url: null,
          },
        ],
      }),
    ),
  };

  const routineSharingServiceMock: Pick<
    RoutineSharingService,
    'generateShareCode' | 'getSharedRoutine' | 'importSharedRoutine'
  > = {
    generateShareCode: jest.fn().mockResolvedValue({
      code: 'MUSC-ABC123',
      expiresAt: new Date('2026-03-29T00:00:00.000Z'),
    }),
    getSharedRoutine: jest.fn().mockResolvedValue({
      code: 'MUSC-ABC123',
      expiresAt: new Date('2026-03-29T00:00:00.000Z'),
      viewCount: 3,
      mesocycle: {
        id: 'mesocycle-1',
        name: 'Plan base',
        description: null,
        durationWeeks: 8,
        objective: TrainingObjective.HYPERTROPHY,
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
      },
    }),
    importSharedRoutine: jest.fn().mockResolvedValue({
      mesocycleId: 'imported-1',
      name: 'Plan base (Importado)',
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
      .overrideProvider(ArticleService)
      .useValue(articleServiceMock)
      .overrideProvider(RoutineSharingService)
      .useValue(routineSharingServiceMock)
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

  it('GET /api/v1/academy/articles returns paginated list', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/academy/articles?page=1&limit=20')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          data: Array<{ id: string; category: ArticleCategory }>;
          meta: { total: number };
        };

        expect(body.data[0]?.id).toBe('article-1');
        expect(body.data[0]?.category).toBe(ArticleCategory.FUNDAMENTALS);
        expect(body.meta.total).toBe(1);
      });
  });

  it('GET /api/v1/academy/articles validates pagination constraints', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/academy/articles?limit=101')
      .set('Authorization', 'Bearer valid-token')
      .expect(400);
  });

  it('GET /api/v1/academy/articles/:id returns article detail with references', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/academy/articles/article-1')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          id: string;
          references: Array<{ id: string }>;
        };

        expect(body.id).toBe('article-1');
        expect(body.references).toHaveLength(1);
      });
  });

  it('POST /api/v1/sharing/mesocycles/:id generates share code', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/sharing/mesocycles/mesocycle-1')
      .set('Authorization', 'Bearer valid-token')
      .expect(201)
      .expect((response) => {
        const body = response.body as { code: string };
        expect(body.code).toBe('MUSC-ABC123');
      });
  });

  it('GET /api/v1/sharing/:code is public and returns shared routine preview', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/sharing/MUSC-ABC123')
      .expect(200)
      .expect((response) => {
        const body = response.body as {
          code: string;
          mesocycle: { name: string };
        };

        expect(body.code).toBe('MUSC-ABC123');
        expect(body.mesocycle.name).toBe('Plan base');
      });
  });

  it('POST /api/v1/sharing/:code/import requires authentication', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/sharing/MUSC-ABC123/import')
      .expect(401);
  });

  it('POST /api/v1/sharing/:code/import imports routine for authenticated user', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/sharing/MUSC-ABC123/import')
      .set('Authorization', 'Bearer valid-token')
      .expect(201)
      .expect((response) => {
        const body = response.body as { mesocycleId: string };
        expect(body.mesocycleId).toBe('imported-1');
      });
  });
});
