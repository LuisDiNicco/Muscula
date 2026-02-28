import { ApiProperty } from '@nestjs/swagger';
import { MuscleGroup } from '../../../../../domain/enums';
import { WeeklyVolumeItem } from '../../../../../application/services/volume-tracker.service';

export class WeeklyVolumeItemResponseDto {
  @ApiProperty({ enum: MuscleGroup })
  muscleGroup!: MuscleGroup;

  @ApiProperty()
  effectiveSets!: number;

  @ApiProperty()
  mev!: number;

  @ApiProperty()
  mrv!: number;

  @ApiProperty({ enum: ['BELOW_MEV', 'WITHIN_RANGE', 'ABOVE_MRV'] })
  status!: 'BELOW_MEV' | 'WITHIN_RANGE' | 'ABOVE_MRV';

  static fromItem(item: WeeklyVolumeItem): WeeklyVolumeItemResponseDto {
    return {
      muscleGroup: item.muscleGroup,
      effectiveSets: item.effectiveSets,
      mev: item.mev,
      mrv: item.mrv,
      status: item.status,
    };
  }
}
