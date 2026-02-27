import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ActivityLevel,
  ExperienceLevel,
  Gender,
} from '../../../../../domain/enums';
import type { UpdateUserPayload } from '../../../../../application/interfaces/user-repository.interface';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  username?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(100)
  heightCm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(30)
  currentWeightKg?: number;

  @ApiPropertyOptional({ enum: ActivityLevel })
  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @ApiPropertyOptional({ enum: ExperienceLevel })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experience?: ExperienceLevel;

  toEntity(): UpdateUserPayload {
    return {
      username: this.username,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      heightCm: this.heightCm,
      currentWeightKg: this.currentWeightKg,
      activityLevel: this.activityLevel,
      experience: this.experience,
    };
  }
}
