import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EquipmentType } from '../../../../../domain/enums';

export class CreateEquipmentProfileDto {
  @ApiProperty({ example: 'Home Gym' })
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @ApiProperty({ enum: EquipmentType, isArray: true })
  @IsArray()
  @IsEnum(EquipmentType, { each: true })
  equipment!: EquipmentType[];

  toEntity(): { name: string; equipment: EquipmentType[] } {
    return {
      name: this.name.trim(),
      equipment: this.equipment,
    };
  }
}
