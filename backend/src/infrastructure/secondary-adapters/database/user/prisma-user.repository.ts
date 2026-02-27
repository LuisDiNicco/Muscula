import { Injectable } from '@nestjs/common';
import {
  IUserRepository,
  UpdateUserPayload,
} from '../../../../application/interfaces/user-repository.interface';
import {
  UserEntity,
  UserPreferencesEntity,
} from '../../../../domain/entities/user.entity';
import {
  ActivityLevel,
  ExperienceLevel,
  Gender,
  Language,
  Theme,
  UnitSystem,
} from '../../../../domain/enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    return user === null ? null : this.toEntity(user);
  }

  async findByUsername(username: string): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({
      where: { username },
    });

    return user === null ? null : this.toEntity(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    return user === null ? null : this.toEntity(user);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const created = await this.prismaService.user.create({
      data: {
        email: user.email,
        username: user.username,
        passwordHash: user.passwordHash,
        emailVerified: user.emailVerified,
        avatarUrl: user.avatarUrl,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        heightCm: user.heightCm,
        currentWeightKg: user.currentWeightKg,
        activityLevel: user.activityLevel,
        experience: user.experience,
      },
    });

    await this.prismaService.userPreferences.create({
      data: {
        userId: created.id,
      },
    });

    return this.toEntity(created);
  }

  async update(id: string, data: UpdateUserPayload): Promise<UserEntity> {
    const updated = await this.prismaService.user.update({
      where: { id },
      data,
    });

    return this.toEntity(updated);
  }

  async softDelete(id: string): Promise<void> {
    await this.prismaService.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getPreferences(userId: string): Promise<UserPreferencesEntity | null> {
    const preferences = await this.prismaService.userPreferences.findUnique({
      where: { userId },
    });

    if (preferences === null) {
      return null;
    }

    return {
      unitSystem: preferences.unitSystem as UnitSystem,
      language: preferences.language as Language,
      theme: preferences.theme as Theme,
      restTimeCompoundSec: preferences.restTimeCompoundSec,
      restTimeIsolationSec: preferences.restTimeIsolationSec,
      restAlertBeforeSec: preferences.restAlertBeforeSec,
      notifyRestTimer: preferences.notifyRestTimer,
      notifyReminder: preferences.notifyReminder,
      notifyDeload: preferences.notifyDeload,
      notifyAchievements: preferences.notifyAchievements,
      notifyWeightReminder: preferences.notifyWeightReminder,
    };
  }

  async updatePreferences(
    userId: string,
    data: Partial<UserPreferencesEntity>,
  ): Promise<UserPreferencesEntity> {
    const updated = await this.prismaService.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return {
      unitSystem: updated.unitSystem as UnitSystem,
      language: updated.language as Language,
      theme: updated.theme as Theme,
      restTimeCompoundSec: updated.restTimeCompoundSec,
      restTimeIsolationSec: updated.restTimeIsolationSec,
      restAlertBeforeSec: updated.restAlertBeforeSec,
      notifyRestTimer: updated.notifyRestTimer,
      notifyReminder: updated.notifyReminder,
      notifyDeload: updated.notifyDeload,
      notifyAchievements: updated.notifyAchievements,
      notifyWeightReminder: updated.notifyWeightReminder,
    };
  }

  private toEntity(user: {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    emailVerified: boolean;
    avatarUrl: string | null;
    dateOfBirth: Date | null;
    gender: string | null;
    heightCm: number | null;
    currentWeightKg: number | null;
    activityLevel: string;
    experience: string;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): UserEntity {
    return new UserEntity({
      id: user.id,
      email: user.email,
      username: user.username,
      passwordHash: user.passwordHash,
      emailVerified: user.emailVerified,
      avatarUrl: user.avatarUrl,
      dateOfBirth: user.dateOfBirth,
      gender: (user.gender as Gender | null) ?? null,
      heightCm: user.heightCm,
      currentWeightKg: user.currentWeightKg,
      activityLevel: user.activityLevel as ActivityLevel,
      experience: user.experience as ExperienceLevel,
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
}
