import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from '../../../application/services/user.service';
import type { UserPreferencesEntity } from '../../../domain/entities/user.entity';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../decorators/current-user.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CompleteOnboardingDto } from './dtos/user/complete-onboarding.dto';
import { DeleteAccountDto } from './dtos/user/delete-account.dto';
import { OnboardingResponseDto } from './dtos/user/onboarding-response.dto';
import { UpdatePreferencesDto } from './dtos/user/update-preferences.dto';
import { UpdateProfileDto } from './dtos/user/update-profile.dto';
import { UserPreferencesResponseDto } from './dtos/user/user-preferences-response.dto';
import { UserProfileResponseDto } from './dtos/user/user-profile-response.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  async getProfile(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserProfileResponseDto> {
    const profile = await this.userService.getProfile(user.id);
    return UserProfileResponseDto.fromEntity(profile);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, type: UserProfileResponseDto })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    const profile = await this.userService.updateProfile(
      user.id,
      dto.toEntity(),
    );
    return UserProfileResponseDto.fromEntity(profile);
  }

  @Post('me/onboarding')
  @ApiOperation({ summary: 'Complete onboarding for current user' })
  @ApiResponse({ status: 201, type: OnboardingResponseDto })
  async completeOnboarding(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CompleteOnboardingDto,
  ): Promise<OnboardingResponseDto> {
    const result = await this.userService.onboardUser(user.id, dto.toEntity());
    return OnboardingResponseDto.fromResult(result);
  }

  @Get('me/preferences')
  @ApiOperation({ summary: 'Get current user preferences' })
  @ApiResponse({ status: 200, type: UserPreferencesResponseDto })
  async getPreferences(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.userService.getPreferences(user.id);
    return UserPreferencesResponseDto.fromEntity(preferences);
  }

  @Put('me/preferences')
  @ApiOperation({ summary: 'Update current user preferences' })
  @ApiResponse({ status: 200, type: UserPreferencesResponseDto })
  async updatePreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePreferencesDto,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.userService.updatePreferences(
      user.id,
      dto.toEntity() as Partial<UserPreferencesEntity>,
    );
    return UserPreferencesResponseDto.fromEntity(preferences);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete account' })
  async deleteAccount(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DeleteAccountDto,
  ): Promise<void> {
    await this.userService.deleteAccount(
      user.id,
      dto.toEntity().confirmPassword,
    );
  }
}
