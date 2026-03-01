import { Inject, Injectable } from '@nestjs/common';
import { AuthenticationError } from '../../domain/errors/authentication.error';
import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import {
  UserEntity,
  UserPreferencesEntity,
} from '../../domain/entities/user.entity';
import {
  EQUIPMENT_PROFILE_REPOSITORY,
  type IEquipmentProfileRepository,
} from '../interfaces/equipment-profile-repository.interface';
import {
  type IUserRepository,
  type UpdateUserPayload,
  USER_REPOSITORY,
} from '../interfaces/user-repository.interface';
import {
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '../interfaces/password-hasher.interface';
import {
  type EquipmentType,
  type TrainingObjective,
  type UnitSystem,
} from '../../domain/enums';

export type OnboardingInput = {
  currentWeightKg: number;
  heightCm: number;
  age: number;
  gender: UserEntity['gender'];
  objective: TrainingObjective;
  experience: UserEntity['experience'];
  equipment: EquipmentType[];
  unitSystem: UnitSystem;
};

export type OnboardingResult = {
  profile: UserEntity;
  preferences: UserPreferencesEntity;
  equipmentProfileId: string | null;
  suggestedMesocycleTemplate: string;
};

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(EQUIPMENT_PROFILE_REPOSITORY)
    private readonly equipmentProfileRepository: IEquipmentProfileRepository,
  ) {}

  async getProfile(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new EntityNotFoundError('User', userId);
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: UpdateUserPayload,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new EntityNotFoundError('User', userId);
    }

    return this.userRepository.update(userId, data);
  }

  async getPreferences(userId: string): Promise<UserPreferencesEntity> {
    const preferences = await this.userRepository.getPreferences(userId);
    if (preferences === null) {
      return this.userRepository.updatePreferences(userId, {});
    }

    return preferences;
  }

  async updatePreferences(
    userId: string,
    data: Partial<UserPreferencesEntity>,
  ): Promise<UserPreferencesEntity> {
    return this.userRepository.updatePreferences(userId, data);
  }

  async onboardUser(
    userId: string,
    data: OnboardingInput,
  ): Promise<OnboardingResult> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new EntityNotFoundError('User', userId);
    }

    const dateOfBirth = this.calculateDateOfBirth(data.age);
    const profile = await this.userRepository.update(userId, {
      currentWeightKg: data.currentWeightKg,
      heightCm: data.heightCm,
      dateOfBirth,
      gender: data.gender,
      experience: data.experience,
    });

    const preferences = await this.userRepository.updatePreferences(userId, {
      unitSystem: data.unitSystem,
    });

    const equipmentProfileId = await this.upsertOnboardingEquipment(
      userId,
      data.equipment,
    );

    return {
      profile,
      preferences,
      equipmentProfileId,
      suggestedMesocycleTemplate: `${data.objective}_${data.experience}`,
    };
  }

  async deleteAccount(userId: string, confirmPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (user === null) {
      throw new EntityNotFoundError('User', userId);
    }

    const validPassword = await this.passwordHasher.compare(
      confirmPassword,
      user.passwordHash,
    );

    if (!validPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    await this.userRepository.softDelete(userId);
  }

  private calculateDateOfBirth(age: number): Date {
    const now = new Date();
    return new Date(now.getFullYear() - age, now.getMonth(), now.getDate());
  }

  private async upsertOnboardingEquipment(
    userId: string,
    equipment: EquipmentType[],
  ): Promise<string | null> {
    if (equipment.length === 0) {
      return null;
    }

    const activeProfile =
      await this.equipmentProfileRepository.findActiveByUser(userId);

    if (activeProfile !== null) {
      const updatedProfile = await this.equipmentProfileRepository.update(
        userId,
        activeProfile.id,
        {
          equipment,
        },
      );

      return updatedProfile.id;
    }

    const createdProfile = await this.equipmentProfileRepository.create({
      userId,
      name: 'Onboarding',
      equipment,
    });

    await this.equipmentProfileRepository.setActive(userId, createdProfile.id);

    return createdProfile.id;
  }
}
