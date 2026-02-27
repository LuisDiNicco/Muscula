import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicator } from '@nestjs/terminus';
import request, { type Response as SupertestResponse } from 'supertest';
import { AppModule } from '../../src/app.module';
import { AuthService } from '../../src/application/services/auth.service';
import { UserService } from '../../src/application/services/user.service';
import { PrismaService } from '../../src/infrastructure/secondary-adapters/database/prisma/prisma.service';
import { TOKEN_SERVICE } from '../../src/application/interfaces/token-service.interface';
import { UserEntity } from '../../src/domain/entities/user.entity';
import { ActivityLevel, ExperienceLevel } from '../../src/domain/enums';
import { GlobalExceptionFilter } from '../../src/infrastructure/base/filters/global-exception.filter';

describe('Auth/User (e2e)', () => {
  let app: INestApplication;

  const now = new Date('2026-02-27T10:00:00.000Z');

  const buildUser = (): UserEntity =>
    new UserEntity({
      id: 'user-1',
      email: 'luis@example.com',
      username: 'luisfit',
      passwordHash: 'hashed-password',
      emailVerified: true,
      avatarUrl: null,
      dateOfBirth: null,
      gender: null,
      heightCm: null,
      currentWeightKg: null,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE,
      experience: ExperienceLevel.INTERMEDIATE,
      deletedAt: null,
      createdAt: now,
      updatedAt: now,
    });

  const authServiceMock: Pick<
    AuthService,
    | 'register'
    | 'login'
    | 'refreshToken'
    | 'logout'
    | 'forgotPassword'
    | 'resetPassword'
  > = {
    register: jest.fn().mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: buildUser(),
    }),
    login: jest.fn().mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: buildUser(),
    }),
    refreshToken: jest.fn().mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    }),
    logout: jest.fn().mockResolvedValue(undefined),
    forgotPassword: jest.fn().mockResolvedValue(undefined),
    resetPassword: jest.fn().mockResolvedValue(undefined),
  };

  const userServiceMock: Pick<
    UserService,
    | 'getProfile'
    | 'updateProfile'
    | 'getPreferences'
    | 'updatePreferences'
    | 'deleteAccount'
  > = {
    getProfile: jest.fn().mockResolvedValue(buildUser()),
    updateProfile: jest.fn().mockResolvedValue(buildUser()),
    getPreferences: jest.fn().mockResolvedValue({
      unitSystem: 'METRIC',
      language: 'ES',
      theme: 'DARK',
      restTimeCompoundSec: 180,
      restTimeIsolationSec: 90,
      restAlertBeforeSec: 30,
      notifyRestTimer: true,
      notifyReminder: true,
      notifyDeload: true,
      notifyAchievements: true,
      notifyWeightReminder: true,
    }),
    updatePreferences: jest.fn().mockResolvedValue({
      unitSystem: 'METRIC',
      language: 'ES',
      theme: 'DARK',
      restTimeCompoundSec: 180,
      restTimeIsolationSec: 90,
      restAlertBeforeSec: 30,
      notifyRestTimer: true,
      notifyReminder: true,
      notifyDeload: true,
      notifyAchievements: true,
      notifyWeightReminder: true,
    }),
    deleteAccount: jest.fn().mockResolvedValue(undefined),
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
      .overrideProvider(AuthService)
      .useValue(authServiceMock)
      .overrideProvider(UserService)
      .useValue(userServiceMock)
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

  it('POST /api/v1/auth/register returns 201 with token', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/auth/register')
      .send({
        email: 'luis@example.com',
        password: 'StrongPass123!',
        username: 'luisfit',
      })
      .expect(201)
      .expect((response: SupertestResponse) => {
        const body = response.body as {
          accessToken: string;
          user: { id: string };
        };
        expect(body.accessToken).toBe('access-token');
        expect(body.user.id).toBe('user-1');
      });
  });

  it('POST /api/v1/auth/login returns 200 with token', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .post('/api/v1/auth/login')
      .send({
        email: 'luis@example.com',
        password: 'StrongPass123!',
      })
      .expect(200)
      .expect((response: SupertestResponse) => {
        const body = response.body as { accessToken: string };
        expect(body.accessToken).toBe('access-token');
      });
  });

  it('GET /api/v1/users/me returns 401 when token is missing', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    await request(httpServer).get('/api/v1/users/me').expect(401);
  });

  it('GET /api/v1/users/me returns 200 with token', async () => {
    const httpServer = app.getHttpServer() as Parameters<typeof request>[0];

    await request(httpServer)
      .get('/api/v1/users/me')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect((response: SupertestResponse) => {
        const body = response.body as { id: string; email: string };
        expect(body.id).toBe('user-1');
        expect(body.email).toBe('luis@example.com');
      });
  });
});
