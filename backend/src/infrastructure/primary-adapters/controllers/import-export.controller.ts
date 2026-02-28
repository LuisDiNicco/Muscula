import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ImportExportService } from '../../../application/services/import-export.service';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../decorators/current-user.decorator';
import { ConfirmImportDto } from './dtos/import-export/confirm-import.dto';
import {
  ConfirmImportResponseDto,
  ExportDataResponseDto,
  PreviewImportResponseDto,
} from './dtos/import-export/import-export-response.dto';
import { PreviewImportDto } from './dtos/import-export/preview-import.dto';

@ApiTags('Data')
@Controller('data')
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Post('export')
  @ApiOperation({
    summary: 'Export user sessions, nutrition and body metrics to ZIP',
  })
  @ApiResponse({ status: 201, type: ExportDataResponseDto })
  async exportData(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ExportDataResponseDto> {
    const result = await this.importExportService.exportData(user.id);

    return {
      fileName: result.fileName,
      url: result.url,
      expiresAt: result.expiresAt.toISOString(),
    };
  }

  @Post('import/preview')
  @ApiOperation({ summary: 'Parse and preview import CSV from Strong or Hevy' })
  @ApiResponse({ status: 201, type: PreviewImportResponseDto })
  async previewImport(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PreviewImportDto,
  ): Promise<PreviewImportResponseDto> {
    const result = await this.importExportService.previewImport(
      user.id,
      dto.source,
      dto.csvContent,
    );

    return {
      ...result,
      expiresAt: result.expiresAt.toISOString(),
    };
  }

  @Post('import/confirm')
  @ApiOperation({
    summary: 'Confirm import preview and persist imported sessions',
  })
  @ApiResponse({ status: 201, type: ConfirmImportResponseDto })
  async confirmImport(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConfirmImportDto,
  ): Promise<ConfirmImportResponseDto> {
    return this.importExportService.confirmImport(
      user.id,
      dto.previewId,
      dto.customMappings ?? [],
    );
  }
}
