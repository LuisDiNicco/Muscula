import { ApiProperty } from '@nestjs/swagger';
import { PersonalRecordsResult } from '../../../../../application/services/analytics.service';
import { AnalyticsPeriodDto } from './analytics-period.enum';

class BestSetResponseDto {
  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  weightKg!: number;

  @ApiProperty()
  reps!: number;

  @ApiProperty()
  rir!: number;
}

class BestVolumeSessionResponseDto {
  @ApiProperty()
  sessionId!: string;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  tonnage!: number;
}

export class PersonalRecordsResponseDto {
  @ApiProperty()
  exerciseId!: string;

  @ApiProperty({ enum: AnalyticsPeriodDto })
  period!: AnalyticsPeriodDto;

  @ApiProperty({ nullable: true })
  bestOneRm!: number | null;

  @ApiProperty({ nullable: true, type: BestSetResponseDto })
  bestSet!: BestSetResponseDto | null;

  @ApiProperty({ nullable: true, type: BestVolumeSessionResponseDto })
  bestVolumeSession!: BestVolumeSessionResponseDto | null;

  static fromResult(result: PersonalRecordsResult): PersonalRecordsResponseDto {
    return {
      exerciseId: result.exerciseId,
      period: result.period as AnalyticsPeriodDto,
      bestOneRm: result.bestOneRm,
      bestSet:
        result.bestSet === null
          ? null
          : {
              sessionId: result.bestSet.sessionId,
              date: result.bestSet.date.toISOString(),
              weightKg: result.bestSet.weightKg,
              reps: result.bestSet.reps,
              rir: result.bestSet.rir,
            },
      bestVolumeSession:
        result.bestVolumeSession === null
          ? null
          : {
              sessionId: result.bestVolumeSession.sessionId,
              date: result.bestVolumeSession.date.toISOString(),
              tonnage: result.bestVolumeSession.tonnage,
            },
    };
  }
}
