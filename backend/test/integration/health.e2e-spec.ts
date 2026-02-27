import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request, { type Response as SupertestResponse } from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../../src/infrastructure/secondary-adapters/database/prisma/prisma.service';

describe('Health Check (e2e)', () => {
  let app: INestApplication;

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
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/health (GET) should return 200 with status ok', () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    return request(httpServer)
      .get('/api/v1/health')
      .expect(200)
      .expect((res: SupertestResponse) => {
        expect(res.body).toHaveProperty('status', 'ok');
      });
  });
});
