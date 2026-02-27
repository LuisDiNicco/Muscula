import { Inject, Injectable } from '@nestjs/common';
import { AuthenticationError } from '../../domain/errors/authentication.error';
import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import {
  UserEntity,
  UserPreferencesEntity,
} from '../../domain/entities/user.entity';
import {
  type IUserRepository,
  type UpdateUserPayload,
  USER_REPOSITORY,
} from '../interfaces/user-repository.interface';
import {
  type IPasswordHasher,
  PASSWORD_HASHER,
} from '../interfaces/password-hasher.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
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
}
