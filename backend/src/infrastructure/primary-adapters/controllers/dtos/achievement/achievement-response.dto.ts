import { ApiProperty } from '@nestjs/swagger';
import type { AchievementWithStatus } from '../../../../../application/interfaces/achievement-repository.interface';

export class AchievementResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  titleEs!: string;

  @ApiProperty()
  titleEn!: string;

  @ApiProperty()
  descriptionEs!: string;

  @ApiProperty()
  descriptionEn!: string;

  @ApiProperty()
  iconUrl!: string;

  @ApiProperty()
  condition!: string;

  @ApiProperty()
  unlocked!: boolean;

  @ApiProperty({ nullable: true })
  unlockedAt!: string | null;

  static fromItem(item: AchievementWithStatus): AchievementResponseDto {
    return {
      id: item.id,
      code: item.code,
      titleEs: item.titleEs,
      titleEn: item.titleEn,
      descriptionEs: item.descriptionEs,
      descriptionEn: item.descriptionEn,
      iconUrl: item.iconUrl,
      condition: item.condition,
      unlocked: item.unlockedAt !== null,
      unlockedAt:
        item.unlockedAt === null ? null : item.unlockedAt.toISOString(),
    };
  }
}
