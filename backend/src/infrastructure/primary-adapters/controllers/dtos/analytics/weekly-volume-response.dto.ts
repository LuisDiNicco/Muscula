import { ApiProperty } from '@nestjs/swagger';
import {
  WeeklyVolumeResult,
  type WeeklyVolumeItem,
} from '../../../../../application/services/volume-tracker.service';
import { WeeklyVolumeItemResponseDto } from './weekly-volume-item-response.dto';

export class WeeklyVolumeResponseDto {
  @ApiProperty()
  weekOffset!: number;

  @ApiProperty()
  weekStart!: string;

  @ApiProperty()
  weekEnd!: string;

  @ApiProperty({ type: WeeklyVolumeItemResponseDto, isArray: true })
  items!: WeeklyVolumeItemResponseDto[];

  static fromResult(result: WeeklyVolumeResult): WeeklyVolumeResponseDto {
    return {
      weekOffset: result.weekOffset,
      weekStart: result.weekStart.toISOString(),
      weekEnd: result.weekEnd.toISOString(),
      items: result.items.map((item: WeeklyVolumeItem) =>
        WeeklyVolumeItemResponseDto.fromItem(item),
      ),
    };
  }
}
