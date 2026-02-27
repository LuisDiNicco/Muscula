import {
  ActivityLevel,
  ExperienceLevel,
  Gender,
  Language,
  Theme,
  UnitSystem,
} from '../enums';

export type UserEntityProps = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  emailVerified: boolean;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  gender: Gender | null;
  heightCm: number | null;
  currentWeightKg: number | null;
  activityLevel: ActivityLevel;
  experience: ExperienceLevel;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserPreferencesEntity = {
  unitSystem: UnitSystem;
  language: Language;
  theme: Theme;
  restTimeCompoundSec: number;
  restTimeIsolationSec: number;
  restAlertBeforeSec: number;
  notifyRestTimer: boolean;
  notifyReminder: boolean;
  notifyDeload: boolean;
  notifyAchievements: boolean;
  notifyWeightReminder: boolean;
};

export class UserEntity {
  constructor(private readonly props: UserEntityProps) {}

  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get username(): string {
    return this.props.username;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }

  get dateOfBirth(): Date | null {
    return this.props.dateOfBirth;
  }

  get gender(): Gender | null {
    return this.props.gender;
  }

  get heightCm(): number | null {
    return this.props.heightCm;
  }

  get currentWeightKg(): number | null {
    return this.props.currentWeightKg;
  }

  get activityLevel(): ActivityLevel {
    return this.props.activityLevel;
  }

  get experience(): ExperienceLevel {
    return this.props.experience;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isEmailVerified(): boolean {
    return this.props.emailVerified;
  }

  canLogin(): boolean {
    return this.props.deletedAt === null && this.props.emailVerified;
  }

  toObject(): UserEntityProps {
    return { ...this.props };
  }
}
