import { EquipmentProfileEntity } from '../../domain/entities/equipment-profile.entity';
import { EquipmentType } from '../../domain/enums';

export const EQUIPMENT_PROFILE_REPOSITORY = 'EQUIPMENT_PROFILE_REPOSITORY';

export type CreateEquipmentProfileInput = {
  userId: string;
  name: string;
  equipment: EquipmentType[];
};

export type UpdateEquipmentProfileInput = {
  name?: string;
  equipment?: EquipmentType[];
};

export interface IEquipmentProfileRepository {
  findAllByUser(userId: string): Promise<EquipmentProfileEntity[]>;
  findActiveByUser(userId: string): Promise<EquipmentProfileEntity | null>;
  findById(userId: string, id: string): Promise<EquipmentProfileEntity | null>;
  create(input: CreateEquipmentProfileInput): Promise<EquipmentProfileEntity>;
  update(
    userId: string,
    id: string,
    input: UpdateEquipmentProfileInput,
  ): Promise<EquipmentProfileEntity>;
  delete(userId: string, id: string): Promise<void>;
  setActive(userId: string, id: string): Promise<void>;
}
