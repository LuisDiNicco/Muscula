import { ApiProperty } from '@nestjs/swagger';
import { BodyMode } from '../../../../../domain/enums';

class MacroTargetResponseDto {
  @ApiProperty()
  calories!: number;

  @ApiProperty()
  protein!: number;

  @ApiProperty()
  carbs!: number;

  @ApiProperty()
  fat!: number;
}

export class BodyModeResponseDto {
  @ApiProperty({ enum: BodyMode })
  mode!: BodyMode;

  @ApiProperty({ type: MacroTargetResponseDto, required: false })
  targets?: MacroTargetResponseDto;
}
