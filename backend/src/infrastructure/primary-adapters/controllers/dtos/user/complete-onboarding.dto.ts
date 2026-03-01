import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  Max,
  Min,
} from 'class-validator';
import { type OnboardingInput } from '../../../../../application/services/user.service';
import {
  EquipmentType,
  ExperienceLevel,
  Gender,
  TrainingObjective,
  UnitSystem,
} from '../../../../../domain/enums';

export class CompleteOnboardingDto {
  @ApiProperty({ example: 75.5 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(30)
  @Max(350)
  currentWeightKg!: number;

  @ApiProperty({ example: 178 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(100)
  @Max(260)
  heightCm!: number;

  @ApiProperty({ example: 28 })
  @Type(() => Number)
  @IsInt()
  @Min(13)
  @Max(100)
  age!: number;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender!: Gender;

  @ApiProperty({
    enum: TrainingObjective,
    example: TrainingObjective.HYPERTROPHY,
  })
  @IsEnum(TrainingObjective)
  objective!: TrainingObjective;

  @ApiProperty({ enum: ExperienceLevel, example: ExperienceLevel.INTERMEDIATE })
  @IsEnum(ExperienceLevel)
  experience!: ExperienceLevel;

  @ApiProperty({
    enum: EquipmentType,
    isArray: true,
    example: [EquipmentType.DUMBBELL, EquipmentType.BENCH],
  })
  @IsArray()
  @ArrayUnique()
  @IsEnum(EquipmentType, { each: true })
  equipment!: EquipmentType[];

  @ApiProperty({ enum: UnitSystem, example: UnitSystem.METRIC })
  @IsEnum(UnitSystem)
  unitSystem!: UnitSystem;

  toEntity(): OnboardingInput {
    return {
      currentWeightKg: this.currentWeightKg,
      heightCm: this.heightCm,
      age: this.age,
      gender: this.gender,
      objective: this.objective,
      experience: this.experience,
      equipment: this.equipment,
      unitSystem: this.unitSystem,
    };
  }
}
