import { ApiProperty } from '@nestjs/swagger';
import { MesocycleEntity } from '../../../../../domain/entities/mesocycle.entity';

export class MesocycleSummaryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  durationWeeks!: number;

  @ApiProperty()
  objective!: string;

  @ApiProperty()
  includeDeload!: boolean;

  @ApiProperty()
  status!: string;

  @ApiProperty({ type: Number })
  trainingDaysCount!: number;

  static fromEntity(entity: MesocycleEntity): MesocycleSummaryResponseDto {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      durationWeeks: entity.durationWeeks,
      objective: entity.objective,
      includeDeload: entity.includeDeload,
      status: entity.status,
      trainingDaysCount: entity.trainingDays.length,
    };
  }
}
