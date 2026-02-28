import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ImportSource } from './import-source.enum';

export class PreviewImportDto {
  @ApiProperty({ enum: ImportSource })
  @IsEnum(ImportSource)
  source!: ImportSource;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  csvContent!: string;
}
