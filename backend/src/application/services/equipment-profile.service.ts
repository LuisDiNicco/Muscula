import { Inject, Injectable } from '@nestjs/common';
import {
  CreateEquipmentProfileInput,
  EQUIPMENT_PROFILE_REPOSITORY,
  type IEquipmentProfileRepository,
  UpdateEquipmentProfileInput,
} from '../interfaces/equipment-profile-repository.interface';
import { EquipmentProfileEntity } from '../../domain/entities/equipment-profile.entity';
import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';

@Injectable()
export class EquipmentProfileService {
  constructor(
    @Inject(EQUIPMENT_PROFILE_REPOSITORY)
    private readonly repository: IEquipmentProfileRepository,
  ) {}

  async listProfiles(userId: string): Promise<EquipmentProfileEntity[]> {
    return this.repository.findAllByUser(userId);
  }

  async createProfile(
    userId: string,
    data: Omit<CreateEquipmentProfileInput, 'userId'>,
  ): Promise<EquipmentProfileEntity> {
    return this.repository.create({
      userId,
      ...data,
    });
  }

  async updateProfile(
    userId: string,
    id: string,
    data: UpdateEquipmentProfileInput,
  ): Promise<EquipmentProfileEntity> {
    const existing = await this.repository.findById(userId, id);
    if (existing === null) {
      throw new EntityNotFoundError('EquipmentProfile', id);
    }

    return this.repository.update(userId, id, data);
  }

  async deleteProfile(userId: string, id: string): Promise<void> {
    const existing = await this.repository.findById(userId, id);
    if (existing === null) {
      throw new EntityNotFoundError('EquipmentProfile', id);
    }

    await this.repository.delete(userId, id);
  }

  async activateProfile(userId: string, id: string): Promise<void> {
    const existing = await this.repository.findById(userId, id);
    if (existing === null) {
      throw new EntityNotFoundError('EquipmentProfile', id);
    }

    await this.repository.setActive(userId, id);
  }
}
