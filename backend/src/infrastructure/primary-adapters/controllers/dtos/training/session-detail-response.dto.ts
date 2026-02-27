import { ApiProperty } from '@nestjs/swagger';
import { SessionDetail } from '../../../../../application/interfaces/training-session-repository.interface';
import { SessionEntity } from '../../../../../domain/entities/session.entity';

class WorkingSetResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  setOrder!: number;

  @ApiProperty()
  weightKg!: number;

  @ApiProperty()
  reps!: number;

  @ApiProperty()
  rir!: number;

  @ApiProperty({ nullable: true })
  restTimeSec!: number | null;

  @ApiProperty({ nullable: true })
  notes!: string | null;

  @ApiProperty()
  completed!: boolean;

  @ApiProperty()
  skipped!: boolean;
}

class WarmupSetResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  setOrder!: number;

  @ApiProperty()
  weightKg!: number;

  @ApiProperty()
  reps!: number;

  @ApiProperty()
  completed!: boolean;
}

class SessionExerciseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  exerciseId!: string;

  @ApiProperty()
  exerciseOrder!: number;

  @ApiProperty({ nullable: true })
  originalExerciseId!: string | null;

  @ApiProperty({ type: () => [WorkingSetResponseDto] })
  sets!: WorkingSetResponseDto[];

  @ApiProperty({ type: () => [WarmupSetResponseDto] })
  warmups!: WarmupSetResponseDto[];
}

class ReadinessResponseDto {
  @ApiProperty()
  sleepScore!: number;

  @ApiProperty()
  stressScore!: number;

  @ApiProperty()
  domsScore!: number;

  @ApiProperty()
  totalScore!: number;
}

export class SessionDetailResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  startedAt!: Date;

  @ApiProperty({ nullable: true })
  finishedAt!: Date | null;

  @ApiProperty({ nullable: true })
  durationMinutes!: number | null;

  @ApiProperty({ nullable: true })
  sessionNotes!: string | null;

  @ApiProperty({ type: () => [SessionExerciseResponseDto] })
  exercises!: SessionExerciseResponseDto[];

  @ApiProperty({ nullable: true, type: () => ReadinessResponseDto })
  readiness!: ReadinessResponseDto | null;

  static fromEntity(detail: SessionDetail): SessionDetailResponseDto {
    return {
      id: detail.session.id,
      status: detail.session.status,
      startedAt: detail.session.startedAt,
      finishedAt: detail.session.finishedAt,
      durationMinutes: detail.session.durationMinutes,
      sessionNotes: detail.session.sessionNotes,
      readiness: detail.readiness,
      exercises: detail.exercises,
    };
  }

  static fromSession(session: SessionEntity): SessionDetailResponseDto {
    return {
      id: session.id,
      status: session.status,
      startedAt: session.startedAt,
      finishedAt: session.finishedAt,
      durationMinutes: session.durationMinutes,
      sessionNotes: session.sessionNotes,
      readiness: null,
      exercises: [],
    };
  }
}
