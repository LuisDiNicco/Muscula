import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  DifficultyLevel,
  EquipmentType,
  MovementPattern,
  MuscleGroup,
} from '../../../../../domain/enums';
import type { CreateExerciseInput } from '../../../../../application/interfaces/exercise-repository.interface';

export class CreateExerciseDto {
  @ApiProperty({ example: 'Press de banca plano con barra' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  nameEs!: string;

  @ApiProperty({ example: 'Barbell Flat Bench Press' })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  nameEn!: string;

  @ApiProperty({ enum: MovementPattern })
  @IsEnum(MovementPattern)
  movementPattern!: MovementPattern;

  @ApiProperty({ enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  difficulty!: DifficultyLevel;

  @ApiProperty({ enum: EquipmentType })
  @IsEnum(EquipmentType)
  equipmentType!: EquipmentType;

  @ApiProperty()
  @IsBoolean()
  isCompound!: boolean;

  @ApiProperty({ enum: MuscleGroup, isArray: true })
  @IsArray()
  @IsEnum(MuscleGroup, { each: true })
  primaryMuscles!: MuscleGroup[];

  @ApiProperty({ enum: MuscleGroup, isArray: true })
  @IsArray()
  @IsEnum(MuscleGroup, { each: true })
  secondaryMuscles!: MuscleGroup[];

  toEntity(): Omit<CreateExerciseInput, 'createdByUserId'> {
    return {
      nameEs: this.nameEs.trim(),
      nameEn: this.nameEn.trim(),
      movementPattern: this.movementPattern,
      difficulty: this.difficulty,
      equipmentType: this.equipmentType,
      isCompound: this.isCompound,
      primaryMuscles: this.primaryMuscles,
      secondaryMuscles: this.secondaryMuscles,
    };
  }
}
