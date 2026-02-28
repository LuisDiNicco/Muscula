import { ApiProperty } from '@nestjs/swagger';

export class ExportDataResponseDto {
  @ApiProperty()
  fileName!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  expiresAt!: string;
}

export class ImportMappingResponseDto {
  @ApiProperty()
  exerciseName!: string;

  @ApiProperty({ nullable: true })
  mappedExerciseId!: string | null;

  @ApiProperty({ nullable: true })
  matchedExerciseName!: string | null;

  @ApiProperty()
  confidence!: number;
}

export class PreviewImportResponseDto {
  @ApiProperty()
  previewId!: string;

  @ApiProperty()
  source!: string;

  @ApiProperty()
  totalRows!: number;

  @ApiProperty()
  validRows!: number;

  @ApiProperty()
  discardedRows!: number;

  @ApiProperty({ type: ImportMappingResponseDto, isArray: true })
  mappings!: ImportMappingResponseDto[];

  @ApiProperty({ type: String, isArray: true })
  unmappedExercises!: string[];

  @ApiProperty()
  expiresAt!: string;
}

export class ConfirmImportResponseDto {
  @ApiProperty()
  importedSessions!: number;

  @ApiProperty()
  importedRows!: number;

  @ApiProperty()
  createdCustomExercises!: number;
}
