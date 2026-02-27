import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Language, Theme, UnitSystem } from '../../../../../domain/enums';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: UnitSystem })
  @IsOptional()
  @IsEnum(UnitSystem)
  unitSystem?: UnitSystem;

  @ApiPropertyOptional({ enum: Language })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({ enum: Theme })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(30)
  restTimeCompoundSec?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(30)
  restTimeIsolationSec?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(5)
  restAlertBeforeSec?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyRestTimer?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyReminder?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyDeload?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyAchievements?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyWeightReminder?: boolean;

  toEntity(): Record<string, unknown> {
    return {
      unitSystem: this.unitSystem,
      language: this.language,
      theme: this.theme,
      restTimeCompoundSec: this.restTimeCompoundSec,
      restTimeIsolationSec: this.restTimeIsolationSec,
      restAlertBeforeSec: this.restAlertBeforeSec,
      notifyRestTimer: this.notifyRestTimer,
      notifyReminder: this.notifyReminder,
      notifyDeload: this.notifyDeload,
      notifyAchievements: this.notifyAchievements,
      notifyWeightReminder: this.notifyWeightReminder,
    };
  }
}
