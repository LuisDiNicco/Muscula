import { Inject, Injectable } from '@nestjs/common';
import { ReadinessScoreEntity } from '../../domain/entities/readiness-score.entity';
import { TRAINING_SESSION_REPOSITORY } from '../interfaces/training-session-repository.interface';
import type { ITrainingSessionRepository } from '../interfaces/training-session-repository.interface';

@Injectable()
export class ReadinessService {
  constructor(
    @Inject(TRAINING_SESSION_REPOSITORY)
    private readonly sessionRepository: ITrainingSessionRepository,
  ) {}

  async recordReadiness(
    userId: string,
    sessionId: string,
    sleepScore: number,
    stressScore: number,
    domsScore: number,
  ): Promise<{ totalScore: number }> {
    const readiness = new ReadinessScoreEntity({
      id: '',
      userId,
      sessionId,
      sleepScore,
      stressScore,
      domsScore,
      totalScore: 0,
      createdAt: new Date(),
    });

    const totalScore = readiness.calculateTotal();

    await this.sessionRepository.upsertReadiness(
      userId,
      sessionId,
      sleepScore,
      stressScore,
      domsScore,
      totalScore,
    );

    return { totalScore };
  }
}
