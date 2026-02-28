import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class SubstituteExerciseDto {
  @ApiProperty()
  @IsString()
  @IsUUID()
  newExerciseId!: string;
}
