import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { TOKEN_SERVICE } from '../../src/application/interfaces/token-service.interface';
import { ImportExportService } from '../../src/application/services/import-export.service';
import { GlobalExceptionFilter } from '../../src/infrastructure/base/filters/global-exception.filter';
import { PrismaService } from '../../src/infrastructure/secondary-adapters/database/prisma/prisma.service';

describe('ImportExport (e2e)', () => {
  let app: INestApplication;

  const importExportServiceMock: Pick<
    ImportExportService,
    'exportData' | 'previewImport' | 'confirmImport'
  > = {
    exportData: jest.fn().mockResolvedValue({
      fileName: 'muscula-export.zip',
      url: 'https://signed-url',
      expiresAt: new Date('2026-03-01T00:00:00.000Z'),
    }),
    previewImport: jest.fn().mockResolvedValue({
      previewId: 'preview-1',
      source: 'STRONG',
      totalRows: 2,
      validRows: 2,
      discardedRows: 0,
      mappings: [
        {
          exerciseName: 'Bench Press',
          mappedExerciseId: 'exercise-1',
          matchedExerciseName: 'Bench Press',
          confidence: 1,
        },
      ],
      unmappedExercises: [],
      expiresAt: new Date('2026-02-28T10:00:00.000Z'),
    }),
    confirmImport: jest.fn().mockResolvedValue({
      importedSessions: 1,
      importedRows: 2,
      createdCustomExercises: 0,
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
      .overrideProvider(ImportExportService)
      .useValue(importExportServiceMock)
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

  it('POST /api/v1/data/export returns signed zip metadata', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/data/export')
      .set('Authorization', 'Bearer valid-token')
      .expect(201)
      .expect((response) => {
        const body = response.body as { fileName: string; url: string };
        expect(body.fileName).toBe('muscula-export.zip');
        expect(body.url).toBe('https://signed-url');
      });
  });

  it('POST /api/v1/data/import/preview validates and returns mappings', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/data/import/preview')
      .set('Authorization', 'Bearer valid-token')
      .send({
        source: 'STRONG',
        csvContent:
          'Exercise Name,Date,Weight,Reps\\nBench Press,2026-02-28,100,8',
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as { previewId: string; validRows: number };
        expect(body.previewId).toBe('preview-1');
        expect(body.validRows).toBe(2);
      });
  });

  it('POST /api/v1/data/import/confirm persists import', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/data/import/confirm')
      .set('Authorization', 'Bearer valid-token')
      .send({
        previewId: 'preview-1',
        customMappings: [],
      })
      .expect(201)
      .expect((response) => {
        const body = response.body as { importedSessions: number };
        expect(body.importedSessions).toBe(1);
      });
  });
});
