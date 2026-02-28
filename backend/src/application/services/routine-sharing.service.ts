import { Inject, Injectable } from '@nestjs/common';
import {
  ROUTINE_SHARING_REPOSITORY,
  type IRoutineSharingRepository,
  type ImportedRoutineResult,
  type SharedRoutinePreview,
  type SharedRoutineSummary,
} from '../interfaces/routine-sharing-repository.interface';
import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import { ValidationError } from '../../domain/errors/validation.error';

const SHARE_CODE_PREFIX = 'MUSC';
const SHARE_CODE_LENGTH = 6;
const SHARE_EXPIRATION_DAYS = 30;
const MAX_CODE_ATTEMPTS = 10;

@Injectable()
export class RoutineSharingService {
  constructor(
    @Inject(ROUTINE_SHARING_REPOSITORY)
    private readonly sharingRepository: IRoutineSharingRepository,
  ) {}

  async generateShareCode(
    userId: string,
    mesocycleId: string,
  ): Promise<SharedRoutineSummary> {
    let attempts = 0;

    while (attempts < MAX_CODE_ATTEMPTS) {
      const code = this.generateCode();
      const exists = await this.sharingRepository.codeExists(code);

      if (!exists) {
        const expiresAt = new Date(
          Date.now() + SHARE_EXPIRATION_DAYS * 24 * 60 * 60 * 1000,
        );

        return this.sharingRepository.createShare(
          userId,
          mesocycleId,
          code,
          expiresAt,
        );
      }

      attempts += 1;
    }

    throw new ValidationError('Unable to generate unique share code');
  }

  async getSharedRoutine(code: string): Promise<SharedRoutinePreview> {
    const normalizedCode = code.trim().toUpperCase();
    const preview =
      await this.sharingRepository.getPreviewByCode(normalizedCode);

    if (preview === null) {
      throw new EntityNotFoundError('SharedRoutine', normalizedCode);
    }

    await this.sharingRepository.incrementViewCount(normalizedCode);

    return {
      ...preview,
      viewCount: preview.viewCount + 1,
    };
  }

  async importSharedRoutine(
    userId: string,
    code: string,
  ): Promise<ImportedRoutineResult> {
    const normalizedCode = code.trim().toUpperCase();
    return this.sharingRepository.importByCode(userId, normalizedCode);
  }

  private generateCode(): string {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let token = '';

    for (let index = 0; index < SHARE_CODE_LENGTH; index += 1) {
      const position = Math.floor(Math.random() * alphabet.length);
      token += alphabet[position];
    }

    return `${SHARE_CODE_PREFIX}-${token}`;
  }
}
