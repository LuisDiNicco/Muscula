import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { EquipmentProfileService } from '../../../application/services/equipment-profile.service';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../decorators/current-user.decorator';
import { CreateEquipmentProfileDto } from './dtos/equipment/create-equipment-profile.dto';
import { EquipmentProfileResponseDto } from './dtos/equipment/equipment-profile-response.dto';
import { UpdateEquipmentProfileDto } from './dtos/equipment/update-equipment-profile.dto';

@ApiTags('Equipment Profiles')
@Controller('equipment-profiles')
export class EquipmentProfileController {
  constructor(
    private readonly equipmentProfileService: EquipmentProfileService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List current user equipment profiles' })
  @ApiResponse({ status: 200, type: [EquipmentProfileResponseDto] })
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EquipmentProfileResponseDto[]> {
    const profiles = await this.equipmentProfileService.listProfiles(user.id);
    return profiles.map((profile) =>
      EquipmentProfileResponseDto.fromEntity(profile),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create equipment profile' })
  @ApiResponse({ status: 201, type: EquipmentProfileResponseDto })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEquipmentProfileDto,
  ): Promise<EquipmentProfileResponseDto> {
    const profile = await this.equipmentProfileService.createProfile(
      user.id,
      dto.toEntity(),
    );

    return EquipmentProfileResponseDto.fromEntity(profile);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update equipment profile' })
  @ApiResponse({ status: 200, type: EquipmentProfileResponseDto })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateEquipmentProfileDto,
  ): Promise<EquipmentProfileResponseDto> {
    const profile = await this.equipmentProfileService.updateProfile(
      user.id,
      id,
      dto.toEntity(),
    );

    return EquipmentProfileResponseDto.fromEntity(profile);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Activate equipment profile' })
  async activate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.equipmentProfileService.activateProfile(user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete equipment profile' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.equipmentProfileService.deleteProfile(user.id, id);
  }
}
