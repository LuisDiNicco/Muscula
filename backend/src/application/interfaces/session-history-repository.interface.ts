import { EquipmentType, MovementPattern } from '../../domain/enums';

export const SESSION_HISTORY_REPOSITORY = 'SESSION_HISTORY_REPOSITORY';

export type LastSessionPerformance = {
  weightKg: number;
  reps: number;
  rir: number;
  rirObjective: number;
  repsObjectiveMin: number;
  movementPattern: MovementPattern;
  equipmentType: EquipmentType;
};

export interface ISessionHistoryRepository {
  findLastPerformance(
    userId: string,
    exerciseId: string,
  ): Promise<LastSessionPerformance | null>;
}
