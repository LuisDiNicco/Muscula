import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MesocycleService } from '../../../application/services/mesocycle.service';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../decorators/current-user.decorator';
import { MesocycleDetailResponseDto } from './dtos/mesocycle/mesocycle-detail-response.dto';

@ApiTags('Training Days')
@Controller('mesocycles/:mesocycleId/training-days')
export class TrainingDayController {
  constructor(private readonly mesocycleService: MesocycleService) {}

  @Get()
  @ApiOperation({ summary: 'Get training days for a mesocycle' })
  @ApiResponse({ status: 200, type: MesocycleDetailResponseDto })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Param('mesocycleId') mesocycleId: string,
  ): Promise<MesocycleDetailResponseDto> {
    const mesocycle = await this.mesocycleService.getMesocycleDetail(
      user.id,
      mesocycleId,
    );

    return MesocycleDetailResponseDto.fromEntity(mesocycle);
  }
}
