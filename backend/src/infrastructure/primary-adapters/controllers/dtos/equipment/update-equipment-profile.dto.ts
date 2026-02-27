import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EquipmentType } from '../../../../../domain/enums';
import type { UpdateEquipmentProfileInput } from '../../../../../application/interfaces/equipment-profile-repository.interface';

export class UpdateEquipmentProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name?: string;

  @ApiPropertyOptional({ enum: EquipmentType, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(EquipmentType, { each: true })
  equipment?: EquipmentType[];

  toEntity(): UpdateEquipmentProfileInput {
    return {
      name: this.name?.trim(),
      equipment: this.equipment,
    };
  }
}
