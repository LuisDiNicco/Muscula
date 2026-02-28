import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BodyMode } from '../../../../../domain/enums';

export class SetBodyModeDto {
  @ApiProperty({ enum: BodyMode })
  @IsEnum(BodyMode)
  mode!: BodyMode;
}
