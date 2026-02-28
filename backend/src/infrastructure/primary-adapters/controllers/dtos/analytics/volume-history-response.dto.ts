import { ApiProperty } from '@nestjs/swagger';
import { WeeklyVolumeResult } from '../../../../../application/services/volume-tracker.service';
import { WeeklyVolumeResponseDto } from './weekly-volume-response.dto';

export class VolumeHistoryResponseDto {
  @ApiProperty({ type: WeeklyVolumeResponseDto, isArray: true })
  weeks!: WeeklyVolumeResponseDto[];

  static fromResult(result: WeeklyVolumeResult[]): VolumeHistoryResponseDto {
    return {
      weeks: result.map((week) => WeeklyVolumeResponseDto.fromResult(week)),
    };
  }
}
