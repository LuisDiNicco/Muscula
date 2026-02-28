import { Inject, Injectable } from '@nestjs/common';
import {
  CreateMesocycleInput,
  MESOCYCLE_REPOSITORY,
  MesocycleFilters,
  type IMesocycleRepository,
  type UpdateMesocycleInput,
} from '../interfaces/mesocycle-repository.interface';
import { MesocycleEntity } from '../../domain/entities/mesocycle.entity';
import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';
import { ValidationError } from '../../domain/errors/validation.error';
import { AchievementService } from './achievement.service';

@Injectable()
export class MesocycleService {
  constructor(
    @Inject(MESOCYCLE_REPOSITORY)
    private readonly mesocycleRepository: IMesocycleRepository,
    private readonly achievementService: AchievementService,
  ) {}

  async listMesocycles(
    userId: string,
    filters: MesocycleFilters,
    page: number,
    limit: number,
  ): Promise<{
    data: MesocycleEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const sanitizedPage = page > 0 ? page : 1;
    const sanitizedLimit = limit > 0 ? Math.min(limit, 100) : 20;

    const result = await this.mesocycleRepository.findAllByUser(
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

  async getMesocycleDetail(
    userId: string,
    id: string,
  ): Promise<MesocycleEntity> {
    const mesocycle = await this.mesocycleRepository.findById(userId, id);
    if (mesocycle === null) {
      throw new EntityNotFoundError('Mesocycle', id);
    }

    return mesocycle;
  }

  async createMesocycle(
    userId: string,
    input: Omit<CreateMesocycleInput, 'userId'>,
  ): Promise<MesocycleEntity> {
    this.assertMesocycleRules(input.durationWeeks, input.trainingDays.length);

    return this.mesocycleRepository.create({
      ...input,
      userId,
    });
  }

  async updateMesocycle(
    userId: string,
    id: string,
    input: UpdateMesocycleInput,
  ): Promise<MesocycleEntity> {
    this.assertMesocycleRules(input.durationWeeks, input.trainingDays.length);

    const existing = await this.getMesocycleDetail(userId, id);
    if (!existing.isDraft()) {
      throw new ValidationError('Only DRAFT mesocycles can be updated');
    }

    return this.mesocycleRepository.update(userId, id, input);
  }

  async deleteMesocycle(userId: string, id: string): Promise<void> {
    await this.getMesocycleDetail(userId, id);
    await this.mesocycleRepository.softDelete(userId, id);
  }

  async duplicateMesocycle(
    userId: string,
    id: string,
  ): Promise<MesocycleEntity> {
    await this.getMesocycleDetail(userId, id);
    return this.mesocycleRepository.duplicate(userId, id);
  }

  async activateMesocycle(userId: string, id: string): Promise<void> {
    const mesocycle = await this.getMesocycleDetail(userId, id);
    if (!mesocycle.canActivate()) {
      throw new ValidationError('Only DRAFT mesocycles can be activated');
    }

    await this.mesocycleRepository.activate(userId, id);
  }

  async completeMesocycle(userId: string, id: string): Promise<void> {
    const mesocycle = await this.getMesocycleDetail(userId, id);
    if (!mesocycle.canComplete()) {
      throw new ValidationError('Only ACTIVE mesocycles can be completed');
    }

    await this.mesocycleRepository.complete(userId, id);
    await this.achievementService.evaluateAchievements(
      userId,
      'MESOCYCLE_COMPLETED',
    );
  }

  private assertMesocycleRules(
    durationWeeks: number,
    trainingDaysCount: number,
  ): void {
    if (durationWeeks < 3 || durationWeeks > 16) {
      throw new ValidationError('durationWeeks must be between 3 and 16');
    }

    if (trainingDaysCount <= 0 || trainingDaysCount > 7) {
      throw new ValidationError(
        'trainingDays must contain between 1 and 7 days',
      );
    }
  }
}
