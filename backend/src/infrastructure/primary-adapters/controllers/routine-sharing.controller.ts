import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoutineSharingService } from '../../../application/services/routine-sharing.service';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { CreateShareResponseDto } from './dtos/sharing/create-share-response.dto';
import {
  ImportSharedRoutineResponseDto,
  SharedRoutineResponseDto,
} from './dtos/sharing/shared-routine-response.dto';

@ApiTags('Sharing')
@Controller('sharing')
export class RoutineSharingController {
  constructor(private readonly sharingService: RoutineSharingService) {}

  @Post('mesocycles/:mesocycleId')
  @ApiOperation({ summary: 'Generate a share code for a mesocycle' })
  @ApiResponse({ status: 201, type: CreateShareResponseDto })
  async generateShareCode(
    @CurrentUser() user: AuthenticatedUser,
    @Param('mesocycleId') mesocycleId: string,
  ): Promise<CreateShareResponseDto> {
    const result = await this.sharingService.generateShareCode(
      user.id,
      mesocycleId,
    );

    return CreateShareResponseDto.fromResult(result);
  }

  @Public()
  @Get(':code')
  @ApiOperation({ summary: 'Get public shared routine preview by code' })
  @ApiResponse({ status: 200, type: SharedRoutineResponseDto })
  async getSharedRoutine(
    @Param('code') code: string,
  ): Promise<SharedRoutineResponseDto> {
    const result = await this.sharingService.getSharedRoutine(code);
    return SharedRoutineResponseDto.fromResult(result);
  }

  @Post(':code/import')
  @ApiOperation({ summary: 'Import shared routine into current user account' })
  @ApiResponse({ status: 201, type: ImportSharedRoutineResponseDto })
  async importSharedRoutine(
    @CurrentUser() user: AuthenticatedUser,
    @Param('code') code: string,
  ): Promise<ImportSharedRoutineResponseDto> {
    const result = await this.sharingService.importSharedRoutine(user.id, code);
    return ImportSharedRoutineResponseDto.fromResult(result);
  }
}
