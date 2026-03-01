import { UserService } from '../../../src/application/services/user.service';
import { UserEntity } from '../../../src/domain/entities/user.entity';
import {
  ActivityLevel,
  EquipmentType,
  ExperienceLevel,
  Gender,
  TrainingObjective,
  UnitSystem,
} from '../../../src/domain/enums';
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

  const equipmentProfileRepository = {
    findAllByUser: jest.fn(),
    findActiveByUser: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    setActive: jest.fn(),
  };

  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(
      userRepository,
      passwordHasher,
      equipmentProfileRepository,
    );
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

  it('onboardUser should create active equipment profile when none exists', async () => {
    const user = buildUser();
    const updatedProfile = new UserEntity({
      ...user.toObject(),
      currentWeightKg: 78,
      heightCm: 180,
      gender: Gender.MALE,
      experience: ExperienceLevel.BEGINNER,
    });

    userRepository.findById.mockResolvedValue(user);
    userRepository.update.mockResolvedValue(updatedProfile);
    userRepository.updatePreferences.mockResolvedValue({
      unitSystem: UnitSystem.METRIC,
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
    });
    equipmentProfileRepository.findActiveByUser.mockResolvedValue(null);
    equipmentProfileRepository.create.mockResolvedValue({
      id: 'profile-1',
    });
    equipmentProfileRepository.setActive.mockResolvedValue(undefined);

    const result = await service.onboardUser('user-1', {
      currentWeightKg: 78,
      heightCm: 180,
      age: 30,
      gender: Gender.MALE,
      objective: TrainingObjective.HYPERTROPHY,
      experience: ExperienceLevel.BEGINNER,
      equipment: [EquipmentType.DUMBBELL],
      unitSystem: UnitSystem.METRIC,
    });

    expect(equipmentProfileRepository.create).toHaveBeenCalledWith({
      userId: 'user-1',
      name: 'Onboarding',
      equipment: [EquipmentType.DUMBBELL],
    });
    expect(equipmentProfileRepository.setActive).toHaveBeenCalledWith(
      'user-1',
      'profile-1',
    );
    expect(result.equipmentProfileId).toBe('profile-1');
    expect(result.suggestedMesocycleTemplate).toBe('HYPERTROPHY_BEGINNER');
  });

  it('onboardUser should update current active equipment profile', async () => {
    userRepository.findById.mockResolvedValue(buildUser());
    userRepository.update.mockResolvedValue(buildUser());
    userRepository.updatePreferences.mockResolvedValue({
      unitSystem: UnitSystem.IMPERIAL,
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
    });
    equipmentProfileRepository.findActiveByUser.mockResolvedValue({
      id: 'active-profile',
      name: 'Casa',
    });
    equipmentProfileRepository.update.mockResolvedValue({
      id: 'active-profile',
    });

    const result = await service.onboardUser('user-1', {
      currentWeightKg: 80,
      heightCm: 176,
      age: 32,
      gender: Gender.FEMALE,
      objective: TrainingObjective.STRENGTH,
      experience: ExperienceLevel.INTERMEDIATE,
      equipment: [EquipmentType.BARBELL, EquipmentType.BENCH],
      unitSystem: UnitSystem.IMPERIAL,
    });

    expect(equipmentProfileRepository.update).toHaveBeenCalledWith(
      'user-1',
      'active-profile',
      {
        equipment: [EquipmentType.BARBELL, EquipmentType.BENCH],
      },
    );
    expect(result.equipmentProfileId).toBe('active-profile');
  });
});
