import { ApiProperty } from '@nestjs/swagger';
import { HeatmapItem } from '../../../../../application/services/analytics.service';
import { MuscleGroup } from '../../../../../domain/enums';

export class HeatmapItemResponseDto {
  @ApiProperty({ enum: MuscleGroup })
  muscleGroup!: MuscleGroup;

  @ApiProperty({ nullable: true })
  lastTrainedAt!: string | null;

  @ApiProperty()
  effectiveSetsThisWeek!: number;

  @ApiProperty({ enum: ['FRESH', 'RECENT', 'FATIGUED', 'STALE'] })
  recovery!: 'FRESH' | 'RECENT' | 'FATIGUED' | 'STALE';

  static fromItem(item: HeatmapItem): HeatmapItemResponseDto {
    return {
      muscleGroup: item.muscleGroup,
      lastTrainedAt:
        item.lastTrainedAt === null ? null : item.lastTrainedAt.toISOString(),
      effectiveSetsThisWeek: item.effectiveSetsThisWeek,
      recovery: item.recovery,
    };
  }
}

export class HeatmapResponseDto {
  @ApiProperty({ type: HeatmapItemResponseDto, isArray: true })
  items!: HeatmapItemResponseDto[];

  static fromResult(items: HeatmapItem[]): HeatmapResponseDto {
    return {
      items: items.map((item) => HeatmapItemResponseDto.fromItem(item)),
    };
  }
}
