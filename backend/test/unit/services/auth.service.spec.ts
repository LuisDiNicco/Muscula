import { AuthService } from '../../../src/application/services/auth.service';
import { UserEntity } from '../../../src/domain/entities/user.entity';
import { ActivityLevel, ExperienceLevel } from '../../../src/domain/enums';
import { ConflictError } from '../../../src/domain/errors/conflict.error';
import { AuthenticationError } from '../../../src/domain/errors/authentication.error';
import { RefreshTokenEntity } from '../../../src/domain/entities/refresh-token.entity';

describe('AuthService', () => {
  const now = new Date();

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

  const buildRefreshToken = (): RefreshTokenEntity =>
    new RefreshTokenEntity({
      id: 'rt-1',
      userId: 'user-1',
      token: 'refresh-token',
      expiresAt: new Date(now.getTime() + 60_000),
      createdAt: now,
    });

  const userRepository = {
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
  };

  const refreshTokenRepository = {
    create: jest.fn(),
    findByToken: jest.fn(),
    deleteByToken: jest.fn(),
    deleteAllByUserId: jest.fn(),
  };

  const passwordHasher = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const tokenService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    generatePasswordResetToken: jest.fn(),
    verifyAccessToken: jest.fn(),
    verifyPasswordResetToken: jest.fn(),
  };

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(
      userRepository,
      refreshTokenRepository,
      passwordHasher,
      tokenService,
    );
  });

  it('register should create user and return tokens', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByUsername.mockResolvedValue(null);
    passwordHasher.hash.mockResolvedValue('hashed-password');
    userRepository.create.mockResolvedValue(buildUser());
    tokenService.generateAccessToken.mockResolvedValue('access-token');
    tokenService.generateRefreshToken.mockResolvedValue({
      token: 'refresh-token',
      expiresAt: new Date(now.getTime() + 60_000),
    });

    const result = await service.register({
      email: 'Luis@Example.com',
      password: 'StrongPass123!',
      username: 'luisfit',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user.id).toBe('user-1');
    expect(userRepository.create).toHaveBeenCalledTimes(1);
    expect(refreshTokenRepository.create).toHaveBeenCalledWith(
      'user-1',
      'refresh-token',
      expect.any(Date),
    );
  });

  it('register should fail when email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue(buildUser());

    await expect(
      service.register({
        email: 'luis@example.com',
        password: 'StrongPass123!',
        username: 'other',
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('login should fail with invalid password', async () => {
    userRepository.findByEmail.mockResolvedValue(buildUser());
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      service.login({
        email: 'luis@example.com',
        password: 'bad-password',
      }),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('refreshToken should rotate refresh token', async () => {
    refreshTokenRepository.findByToken.mockResolvedValue(buildRefreshToken());
    userRepository.findById.mockResolvedValue(buildUser());
    tokenService.generateAccessToken.mockResolvedValue('new-access-token');
    tokenService.generateRefreshToken.mockResolvedValue({
      token: 'new-refresh-token',
      expiresAt: new Date(now.getTime() + 120_000),
    });

    const result = await service.refreshToken('refresh-token');

    expect(refreshTokenRepository.deleteByToken).toHaveBeenCalledWith(
      'refresh-token',
    );
    expect(refreshTokenRepository.create).toHaveBeenCalledWith(
      'user-1',
      'new-refresh-token',
      expect.any(Date),
    );
    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
  });
});
