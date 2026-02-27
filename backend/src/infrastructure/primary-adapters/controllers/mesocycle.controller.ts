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
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MesocycleService } from '../../../application/services/mesocycle.service';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../decorators/current-user.decorator';
import { CreateMesocycleDto } from './dtos/mesocycle/create-mesocycle.dto';
import { ListMesocyclesQueryDto } from './dtos/mesocycle/list-mesocycles-query.dto';
import { MesocycleDetailResponseDto } from './dtos/mesocycle/mesocycle-detail-response.dto';
import { MesocycleSummaryResponseDto } from './dtos/mesocycle/mesocycle-summary-response.dto';

@ApiTags('Mesocycles')
@Controller('mesocycles')
export class MesocycleController {
  constructor(private readonly mesocycleService: MesocycleService) {}

  @Get()
  @ApiOperation({ summary: 'List mesocycles with filters and pagination' })
  @ApiResponse({ status: 200 })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListMesocyclesQueryDto,
  ): Promise<{
    data: MesocycleSummaryResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const result = await this.mesocycleService.listMesocycles(
      user.id,
      {
        status: query.status,
        objective: query.objective,
        search: query.search,
      },
      query.page ?? 1,
      query.limit ?? 20,
    );

    return {
      data: result.data.map((mesocycle) =>
        MesocycleSummaryResponseDto.fromEntity(mesocycle),
      ),
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / result.limit)),
      },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get mesocycle detail with training days and exercises',
  })
  @ApiResponse({ status: 200, type: MesocycleDetailResponseDto })
  async detail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<MesocycleDetailResponseDto> {
    const mesocycle = await this.mesocycleService.getMesocycleDetail(
      user.id,
      id,
    );
    return MesocycleDetailResponseDto.fromEntity(mesocycle);
  }

  @Post()
  @ApiOperation({ summary: 'Create mesocycle in one transaction' })
  @ApiResponse({ status: 201, type: MesocycleDetailResponseDto })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateMesocycleDto,
  ): Promise<MesocycleDetailResponseDto> {
    const mesocycle = await this.mesocycleService.createMesocycle(
      user.id,
      dto.toEntity(),
    );

    return MesocycleDetailResponseDto.fromEntity(mesocycle);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update mesocycle only if DRAFT' })
  @ApiResponse({ status: 200, type: MesocycleDetailResponseDto })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: CreateMesocycleDto,
  ): Promise<MesocycleDetailResponseDto> {
    const mesocycle = await this.mesocycleService.updateMesocycle(
      user.id,
      id,
      dto.toEntity(),
    );

    return MesocycleDetailResponseDto.fromEntity(mesocycle);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete mesocycle' })
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.mesocycleService.deleteMesocycle(user.id, id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate mesocycle to DRAFT copy' })
  @ApiResponse({ status: 201, type: MesocycleDetailResponseDto })
  async duplicate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<MesocycleDetailResponseDto> {
    const duplicate = await this.mesocycleService.duplicateMesocycle(
      user.id,
      id,
    );
    return MesocycleDetailResponseDto.fromEntity(duplicate);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Activate DRAFT mesocycle and archive previous active',
  })
  async activate(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.mesocycleService.activateMesocycle(user.id, id);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Complete ACTIVE mesocycle' })
  async complete(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<void> {
    await this.mesocycleService.completeMesocycle(user.id, id);
  }
}
