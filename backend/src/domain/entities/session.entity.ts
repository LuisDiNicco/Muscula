import { SessionStatus } from '../enums';
import { ValidationError } from '../errors/validation.error';

export type SessionEntityProps = {
  id: string;
  userId: string;
  mesocycleId: string | null;
  trainingDayId: string | null;
  weekNumber: number | null;
  status: SessionStatus;
  startedAt: Date;
  finishedAt: Date | null;
  durationMinutes: number | null;
  sessionNotes: string | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class SessionEntity {
  constructor(private readonly props: SessionEntityProps) {}

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get status(): SessionStatus {
    return this.props.status;
  }

  get startedAt(): Date {
    return this.props.startedAt;
  }

  get finishedAt(): Date | null {
    return this.props.finishedAt;
  }

  get durationMinutes(): number | null {
    return this.props.durationMinutes;
  }

  get sessionNotes(): string | null {
    return this.props.sessionNotes;
  }

  isInProgress(): boolean {
    return this.props.status === SessionStatus.IN_PROGRESS;
  }

  getDuration(referenceTime: Date = new Date()): number {
    const end = this.props.finishedAt ?? referenceTime;
    const milliseconds = end.getTime() - this.props.startedAt.getTime();

    return Math.max(0, Math.round(milliseconds / 60000));
  }

  complete(notes?: string): void {
    if (!this.isInProgress()) {
      throw new ValidationError('Only IN_PROGRESS sessions can be completed');
    }

    const normalizedNotes = notes?.trim();
    if (normalizedNotes !== undefined && normalizedNotes.length > 1000) {
      throw new ValidationError('sessionNotes must be at most 1000 characters');
    }

    const finishedAt = new Date();
    this.props.status = SessionStatus.COMPLETED;
    this.props.finishedAt = finishedAt;
    this.props.durationMinutes = this.getDuration(finishedAt);
    this.props.sessionNotes = normalizedNotes ?? null;
    this.props.updatedAt = finishedAt;
  }

  abandon(): void {
    if (!this.isInProgress()) {
      throw new ValidationError('Only IN_PROGRESS sessions can be abandoned');
    }

    const finishedAt = new Date();
    this.props.status = SessionStatus.ABANDONED;
    this.props.finishedAt = finishedAt;
    this.props.durationMinutes = this.getDuration(finishedAt);
    this.props.updatedAt = finishedAt;
  }
}
