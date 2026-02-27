import { ApiProperty } from '@nestjs/swagger';
import { ExerciseEntity } from '../../../../../domain/entities/exercise.entity';

export class ExerciseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nameEs!: string;

  @ApiProperty()
  nameEn!: string;

  @ApiProperty()
  movementPattern!: string;

  @ApiProperty()
  difficulty!: string;

  @ApiProperty()
  equipmentType!: string;

  @ApiProperty()
  isCompound!: boolean;

  @ApiProperty({ type: [String] })
  primaryMuscles!: string[];

  @ApiProperty({ type: [String] })
  secondaryMuscles!: string[];

  static fromEntity(entity: ExerciseEntity): ExerciseResponseDto {
    return {
      id: entity.id,
      nameEs: entity.nameEs,
      nameEn: entity.nameEn,
      movementPattern: entity.movementPattern,
      difficulty: entity.difficulty,
      equipmentType: entity.equipmentType,
      isCompound: entity.isCompound,
      primaryMuscles: entity.primaryMuscles,
      secondaryMuscles: entity.secondaryMuscles,
    };
  }
}
