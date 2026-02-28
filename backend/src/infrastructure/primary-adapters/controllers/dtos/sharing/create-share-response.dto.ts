import { ApiProperty } from '@nestjs/swagger';
import type { SharedRoutineSummary } from '../../../../../application/interfaces/routine-sharing-repository.interface';

export class CreateShareResponseDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  expiresAt!: string;

  static fromResult(result: SharedRoutineSummary): CreateShareResponseDto {
    return {
      code: result.code,
      expiresAt: result.expiresAt.toISOString(),
    };
  }
}
