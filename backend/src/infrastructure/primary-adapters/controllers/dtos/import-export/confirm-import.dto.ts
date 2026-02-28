import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ConfirmImportMappingDto {
  @ApiProperty()
  @IsString()
  exerciseName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exerciseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customName?: string;
}

export class ConfirmImportDto {
  @ApiProperty()
  @IsString()
  previewId!: string;

  @ApiProperty({
    type: ConfirmImportMappingDto,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConfirmImportMappingDto)
  customMappings?: ConfirmImportMappingDto[];
}
