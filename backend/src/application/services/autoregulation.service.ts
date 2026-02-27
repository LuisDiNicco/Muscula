import { Inject, Injectable } from '@nestjs/common';
import {
  LastSessionPerformance,
  SESSION_HISTORY_REPOSITORY,
} from '../interfaces/session-history-repository.interface';
import type { ISessionHistoryRepository } from '../interfaces/session-history-repository.interface';
import { EquipmentType, MovementPattern } from '../../domain/enums';

@Injectable()
export class AutoregulationService {
  constructor(
    @Inject(SESSION_HISTORY_REPOSITORY)
    private readonly sessionHistoryRepository: ISessionHistoryRepository,
  ) {}

  async suggestWeight(
    userId: string,
    exerciseId: string,
    readinessScore?: number,
  ): Promise<number | null> {
    const lastSessionData = await this.getLastSessionData(userId, exerciseId);

    if (lastSessionData === null) {
      return null;
    }

    let suggestedWeight = this.applyRirLogic(lastSessionData);

    if (readinessScore !== undefined && readinessScore < 2.5) {
      suggestedWeight *= 0.95;
    }

    const increment = this.calculateIncrement(lastSessionData);

    return this.roundToIncrement(suggestedWeight, increment);
  }

  async getLastSessionData(
    userId: string,
    exerciseId: string,
  ): Promise<LastSessionPerformance | null> {
    return this.sessionHistoryRepository.findLastPerformance(
      userId,
      exerciseId,
    );
  }

  private applyRirLogic(lastSessionData: LastSessionPerformance): number {
    const deltaRir = lastSessionData.rir - lastSessionData.rirObjective;

    if (deltaRir > 0) {
      return lastSessionData.weightKg;
    }

    if (deltaRir === 0) {
      return (
        lastSessionData.weightKg + this.calculateIncrement(lastSessionData)
      );
    }

    if (
      lastSessionData.rir === 0 &&
      lastSessionData.reps < lastSessionData.repsObjectiveMin
    ) {
      return lastSessionData.weightKg * 0.95;
    }

    return lastSessionData.weightKg;
  }

  private calculateIncrement(lastSessionData: LastSessionPerformance): number {
    if (
      lastSessionData.equipmentType === EquipmentType.MACHINE ||
      lastSessionData.movementPattern === MovementPattern.ISOLATION
    ) {
      return 1.25;
    }

    return 2.5;
  }

  private roundToIncrement(value: number, increment: number): number {
    return Math.round(value / increment) * increment;
  }
}
