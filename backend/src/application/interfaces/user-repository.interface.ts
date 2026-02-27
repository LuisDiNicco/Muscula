import {
  UserEntity,
  UserPreferencesEntity,
} from '../../domain/entities/user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export type UpdateUserPayload = {
  username?: string;
  avatarUrl?: string | null;
  dateOfBirth?: Date | null;
  gender?: UserEntity['gender'];
  heightCm?: number | null;
  currentWeightKg?: number | null;
  activityLevel?: UserEntity['activityLevel'];
  experience?: UserEntity['experience'];
  passwordHash?: string;
};

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(user: UserEntity): Promise<UserEntity>;
  update(id: string, data: UpdateUserPayload): Promise<UserEntity>;
  softDelete(id: string): Promise<void>;
  getPreferences(userId: string): Promise<UserPreferencesEntity | null>;
  updatePreferences(
    userId: string,
    data: Partial<UserPreferencesEntity>,
  ): Promise<UserPreferencesEntity>;
}
