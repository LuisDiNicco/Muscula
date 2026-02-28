import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AchievementService } from '../../../application/services/achievement.service';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../decorators/current-user.decorator';
import { AchievementResponseDto } from './dtos/achievement/achievement-response.dto';

@ApiTags('Achievements')
@Controller('achievements')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get()
  @ApiOperation({ summary: 'Get user achievements with unlocked status' })
  @ApiResponse({ status: 200, type: AchievementResponseDto, isArray: true })
  async getAchievements(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AchievementResponseDto[]> {
    const achievements = await this.achievementService.getAchievements(user.id);
    return achievements.map((achievement) =>
      AchievementResponseDto.fromItem(achievement),
    );
  }
}
