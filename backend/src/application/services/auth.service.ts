import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConflictError } from '../../domain/errors/conflict.error';
import { AuthenticationError } from '../../domain/errors/authentication.error';
import { ValidationError } from '../../domain/errors/validation.error';
import { ActivityLevel, ExperienceLevel } from '../../domain/enums';
import { REFRESH_TOKEN_REPOSITORY } from '../interfaces/refresh-token-repository.interface';
import type { IRefreshTokenRepository } from '../interfaces/refresh-token-repository.interface';
import { PASSWORD_HASHER } from '../interfaces/password-hasher.interface';
import type { IPasswordHasher } from '../interfaces/password-hasher.interface';
import {
  JwtPayload,
  TOKEN_SERVICE,
} from '../interfaces/token-service.interface';
import type { ITokenService } from '../interfaces/token-service.interface';
import { USER_REPOSITORY } from '../interfaces/user-repository.interface';
import type { IUserRepository } from '../interfaces/user-repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

type RegisterInput = {
  email: string;
  password: string;
  username: string;
};

type LoginInput = {
  email: string;
  password: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    @Inject(TOKEN_SERVICE)
    private readonly tokenService: ITokenService,
  ) {}

  async register(
    input: RegisterInput,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
    const existingByEmail = await this.userRepository.findByEmail(input.email);
    if (existingByEmail !== null) {
      throw new ConflictError('Email already exists');
    }

    const existingByUsername = await this.userRepository.findByUsername(
      input.username,
    );
    if (existingByUsername !== null) {
      throw new ConflictError('Username already exists');
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const newUser = new UserEntity({
      id: '',
      email: input.email.toLowerCase(),
      username: input.username,
      passwordHash,
      emailVerified: true,
      avatarUrl: null,
      dateOfBirth: null,
      gender: null,
      heightCm: null,
      currentWeightKg: null,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE,
      experience: ExperienceLevel.INTERMEDIATE,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedUser = await this.userRepository.create(newUser);
    return this.issueTokens(savedUser);
  }

  async login(
    input: LoginInput,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
    const user = await this.userRepository.findByEmail(
      input.email.toLowerCase(),
    );
    if (user === null) {
      throw new AuthenticationError('Invalid credentials');
    }

    const validPassword = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );
    if (!validPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    if (!user.canLogin()) {
      throw new AuthenticationError('User is not allowed to login');
    }

    return this.issueTokens(user);
  }

  async refreshToken(
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const existing = await this.refreshTokenRepository.findByToken(token);
    if (existing === null || existing.isExpired()) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const user = await this.userRepository.findById(existing.userId);
    if (user === null) {
      throw new AuthenticationError('Invalid refresh token');
    }

    await this.refreshTokenRepository.deleteByToken(token);

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = await this.tokenService.generateAccessToken(payload);
    const nextRefresh = await this.tokenService.generateRefreshToken();

    await this.refreshTokenRepository.create(
      user.id,
      nextRefresh.token,
      nextRefresh.expiresAt,
    );

    return {
      accessToken,
      refreshToken: nextRefresh.token,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.deleteByToken(refreshToken);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (user === null) {
      return;
    }

    const resetToken = await this.tokenService.generatePasswordResetToken(
      user.id,
    );
    this.logger.log(
      `Generated password reset token for userId=${user.id}: ${resetToken}`,
    );
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const payload = await this.tokenService.verifyPasswordResetToken(token);
    const user = await this.userRepository.findById(payload.sub);
    if (user === null) {
      throw new AuthenticationError('Invalid reset token');
    }

    const reused = await this.passwordHasher.compare(
      newPassword,
      user.passwordHash,
    );
    if (reused) {
      throw new ValidationError(
        'New password must be different from previous one',
      );
    }

    const passwordHash = await this.passwordHasher.hash(newPassword);
    await this.userRepository.update(user.id, { passwordHash });
    await this.refreshTokenRepository.deleteAllByUserId(user.id);
  }

  private async issueTokens(user: UserEntity): Promise<{
    accessToken: string;
    refreshToken: string;
    user: UserEntity;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refresh = await this.tokenService.generateRefreshToken();

    await this.refreshTokenRepository.create(
      user.id,
      refresh.token,
      refresh.expiresAt,
    );

    return {
      accessToken,
      refreshToken: refresh.token,
      user,
    };
  }
}
