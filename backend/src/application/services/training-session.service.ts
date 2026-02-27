import { Inject, Injectable } from '@nestjs/common';
import { SessionEntity } from '../../domain/entities/session.entity';
import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import { ValidationError } from '../../domain/errors/validation.error';
import { TRAINING_SESSION_REPOSITORY } from '../interfaces/training-session-repository.interface';
import type {
  AddSetInput,
  ITrainingSessionRepository,
  SessionDetail,
  SessionListFilters,
  StartSessionInput,
  UpdateSetInput,
} from '../interfaces/training-session-repository.interface';

@Injectable()
export class TrainingSessionService {
  constructor(
    @Inject(TRAINING_SESSION_REPOSITORY)
    private readonly sessionRepository: ITrainingSessionRepository,
  ) {}

  async startSession(input: StartSessionInput): Promise<SessionEntity> {
    const activeSession = await this.sessionRepository.findActiveByUser(
      input.userId,
    );
    if (activeSession !== null) {
      throw new ValidationError('An active session already exists');
    }

    return this.sessionRepository.create(input);
  }

  async getActiveSession(userId: string): Promise<SessionEntity | null> {
    return this.sessionRepository.findActiveByUser(userId);
  }

  async getSessionDetail(
    userId: string,
    sessionId: string,
  ): Promise<SessionDetail> {
    const detail = await this.sessionRepository.findDetailById(
      userId,
      sessionId,
    );
    if (detail === null) {
      throw new EntityNotFoundError('Session', sessionId);
    }

    return detail;
  }

  async addExerciseToSession(
    userId: string,
    sessionId: string,
    exerciseId: string,
    order: number,
  ): Promise<void> {
    await this.ensureSessionExists(userId, sessionId);
    await this.sessionRepository.addExercise(userId, sessionId, {
      exerciseId,
      order,
    });
  }

  async removeExerciseFromSession(
    userId: string,
    sessionId: string,
    exerciseId: string,
  ): Promise<void> {
    await this.ensureSessionExists(userId, sessionId);
    await this.sessionRepository.removeExercise(userId, sessionId, exerciseId);
  }

  async addSet(
    userId: string,
    sessionId: string,
    exerciseId: string,
    input: AddSetInput,
  ): Promise<void> {
    this.validateSetNotes(input.notes);
    await this.ensureSessionExists(userId, sessionId);
    await this.sessionRepository.addSet(userId, sessionId, exerciseId, input);
  }

  async updateSet(
    userId: string,
    sessionId: string,
    setId: string,
    input: UpdateSetInput,
  ): Promise<void> {
    this.validateSetNotes(input.notes);
    await this.ensureSessionExists(userId, sessionId);
    await this.sessionRepository.updateSet(userId, sessionId, setId, input);
  }

  async deleteSet(
    userId: string,
    sessionId: string,
    setId: string,
  ): Promise<void> {
    await this.ensureSessionExists(userId, sessionId);
    await this.sessionRepository.deleteSet(userId, sessionId, setId);
  }

  async completeSession(
    userId: string,
    sessionId: string,
    notes?: string,
  ): Promise<void> {
    this.validateSessionNotes(notes);
    await this.ensureSessionExists(userId, sessionId);
    await this.sessionRepository.completeSession(
      userId,
      sessionId,
      notes?.trim(),
    );
  }

  async abandonSession(userId: string, sessionId: string): Promise<void> {
    await this.ensureSessionExists(userId, sessionId);
    await this.sessionRepository.abandonSession(userId, sessionId);
  }

  async listSessions(
    userId: string,
    filters: SessionListFilters,
    page: number,
    limit: number,
  ): Promise<{
    data: SessionEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const sanitizedPage = page > 0 ? page : 1;
    const sanitizedLimit = limit > 0 ? Math.min(limit, 100) : 20;

    const result = await this.sessionRepository.listByUser(
      userId,
      filters,
      sanitizedPage,
      sanitizedLimit,
    );

    return {
      ...result,
      page: sanitizedPage,
      limit: sanitizedLimit,
    };
  }

  private async ensureSessionExists(
    userId: string,
    sessionId: string,
  ): Promise<void> {
    const session = await this.sessionRepository.findById(userId, sessionId);
    if (session === null) {
      throw new EntityNotFoundError('Session', sessionId);
    }
  }

  private validateSetNotes(notes: string | undefined): void {
    if (notes !== undefined && notes.trim().length > 200) {
      throw new ValidationError('Set notes must be at most 200 characters');
    }
  }

  private validateSessionNotes(notes: string | undefined): void {
    if (notes !== undefined && notes.trim().length > 1000) {
      throw new ValidationError(
        'Session notes must be at most 1000 characters',
      );
    }
  }
}
