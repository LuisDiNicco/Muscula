import { UserService } from '../../../src/application/services/user.service';
import { UserEntity } from '../../../src/domain/entities/user.entity';
import { ActivityLevel, ExperienceLevel } from '../../../src/domain/enums';
import { EntityNotFoundError } from '../../../src/domain/errors/entity-not-found.error';
import { AuthenticationError } from '../../../src/domain/errors/authentication.error';

describe('UserService', () => {
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

  const passwordHasher = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(userRepository, passwordHasher);
  });

  it('getProfile should throw when user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(service.getProfile('missing-user')).rejects.toBeInstanceOf(
      EntityNotFoundError,
    );
  });

  it('updateProfile should call repository update', async () => {
    const user = buildUser();
    userRepository.findById.mockResolvedValue(user);
    userRepository.update.mockResolvedValue(
      new UserEntity({
        ...user.toObject(),
        username: 'newname',
      }),
    );

    const result = await service.updateProfile('user-1', {
      username: 'newname',
    });

    expect(userRepository.update).toHaveBeenCalledWith('user-1', {
      username: 'newname',
    });
    expect(result.username).toBe('newname');
  });

  it('deleteAccount should fail when password is invalid', async () => {
    userRepository.findById.mockResolvedValue(buildUser());
    passwordHasher.compare.mockResolvedValue(false);

    await expect(
      service.deleteAccount('user-1', 'wrong-password'),
    ).rejects.toBeInstanceOf(AuthenticationError);
  });

  it('deleteAccount should soft delete when password is valid', async () => {
    userRepository.findById.mockResolvedValue(buildUser());
    passwordHasher.compare.mockResolvedValue(true);

    await service.deleteAccount('user-1', 'StrongPass123!');

    expect(userRepository.softDelete).toHaveBeenCalledWith('user-1');
  });
});
