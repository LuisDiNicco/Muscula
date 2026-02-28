import { ApiProperty } from '@nestjs/swagger';
import { DeloadCheckResult } from '../../../../../application/services/analytics.service';
import { MuscleGroup } from '../../../../../domain/enums';

export class DeloadCheckResponseDto {
  @ApiProperty()
  needsDeload!: boolean;

  @ApiProperty({ type: [String] })
  reasons!: string[];

  @ApiProperty({ enum: MuscleGroup, isArray: true })
  affectedMuscles!: MuscleGroup[];

  @ApiProperty({ nullable: true })
  readinessAverageLast14Days!: number | null;

  static fromResult(result: DeloadCheckResult): DeloadCheckResponseDto {
    return {
      needsDeload: result.needsDeload,
      reasons: result.reasons,
      affectedMuscles: result.affectedMuscles,
      readinessAverageLast14Days: result.readinessAverageLast14Days,
    };
  }
}
