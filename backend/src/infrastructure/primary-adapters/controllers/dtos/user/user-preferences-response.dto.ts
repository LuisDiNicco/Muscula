import { ApiProperty } from '@nestjs/swagger';
import { UserPreferencesEntity } from '../../../../../domain/entities/user.entity';

export class UserPreferencesResponseDto {
  @ApiProperty()
  unitSystem!: string;

  @ApiProperty()
  language!: string;

  @ApiProperty()
  theme!: string;

  @ApiProperty()
  restTimeCompoundSec!: number;

  @ApiProperty()
  restTimeIsolationSec!: number;

  @ApiProperty()
  restAlertBeforeSec!: number;

  @ApiProperty()
  notifyRestTimer!: boolean;

  @ApiProperty()
  notifyReminder!: boolean;

  @ApiProperty()
  notifyDeload!: boolean;

  @ApiProperty()
  notifyAchievements!: boolean;

  @ApiProperty()
  notifyWeightReminder!: boolean;

  static fromEntity(entity: UserPreferencesEntity): UserPreferencesResponseDto {
    return {
      unitSystem: entity.unitSystem,
      language: entity.language,
      theme: entity.theme,
      restTimeCompoundSec: entity.restTimeCompoundSec,
      restTimeIsolationSec: entity.restTimeIsolationSec,
      restAlertBeforeSec: entity.restAlertBeforeSec,
      notifyRestTimer: entity.notifyRestTimer,
      notifyReminder: entity.notifyReminder,
      notifyDeload: entity.notifyDeload,
      notifyAchievements: entity.notifyAchievements,
      notifyWeightReminder: entity.notifyWeightReminder,
    };
  }
}
