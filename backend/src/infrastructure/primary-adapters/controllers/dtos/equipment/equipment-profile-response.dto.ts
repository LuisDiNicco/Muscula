import { ApiProperty } from '@nestjs/swagger';
import { EquipmentProfileEntity } from '../../../../../domain/entities/equipment-profile.entity';

export class EquipmentProfileResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  isPreset!: boolean;

  @ApiProperty({ type: [String] })
  equipment!: string[];

  static fromEntity(
    entity: EquipmentProfileEntity,
  ): EquipmentProfileResponseDto {
    return {
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      isActive: entity.isActive,
      isPreset: entity.isPreset,
      equipment: entity.equipment,
    };
  }
}
