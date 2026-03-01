import { ApiProperty } from '@nestjs/swagger';
import { type OnboardingResult } from '../../../../../application/services/user.service';
import { UserPreferencesResponseDto } from './user-preferences-response.dto';
import { UserProfileResponseDto } from './user-profile-response.dto';

export class OnboardingResponseDto {
  @ApiProperty({ type: UserProfileResponseDto })
  profile!: UserProfileResponseDto;

  @ApiProperty({ type: UserPreferencesResponseDto })
  preferences!: UserPreferencesResponseDto;

  @ApiProperty({ nullable: true })
  equipmentProfileId!: string | null;

  @ApiProperty({ example: 'HYPERTROPHY_INTERMEDIATE' })
  suggestedMesocycleTemplate!: string;

  static fromResult(result: OnboardingResult): OnboardingResponseDto {
    return {
      profile: UserProfileResponseDto.fromEntity(result.profile),
      preferences: UserPreferencesResponseDto.fromEntity(result.preferences),
      equipmentProfileId: result.equipmentProfileId,
      suggestedMesocycleTemplate: result.suggestedMesocycleTemplate,
    };
  }
}
