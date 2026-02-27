import { Injectable } from '@nestjs/common';
import {
  CreateEquipmentProfileInput,
  IEquipmentProfileRepository,
  UpdateEquipmentProfileInput,
} from '../../../../application/interfaces/equipment-profile-repository.interface';
import { EquipmentProfileEntity } from '../../../../domain/entities/equipment-profile.entity';
import { EntityNotFoundError } from '../../../../domain/errors/entity-not-found.error';
import { EquipmentType } from '../../../../domain/enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaEquipmentProfileRepository implements IEquipmentProfileRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllByUser(userId: string): Promise<EquipmentProfileEntity[]> {
    const rows = await this.prismaService.equipmentProfile.findMany({
      where: { userId },
      include: { equipment: true },
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });

    return rows.map((row) => this.toEntity(row));
  }

  async findById(
    userId: string,
    id: string,
  ): Promise<EquipmentProfileEntity | null> {
    const row = await this.prismaService.equipmentProfile.findFirst({
      where: {
        id,
        userId,
      },
      include: { equipment: true },
    });

    if (row === null) {
      return null;
    }

    return this.toEntity(row);
  }

  async findActiveByUser(
    userId: string,
  ): Promise<EquipmentProfileEntity | null> {
    const row = await this.prismaService.equipmentProfile.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: { equipment: true },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (row === null) {
      return null;
    }

    return this.toEntity(row);
  }

  async create(
    input: CreateEquipmentProfileInput,
  ): Promise<EquipmentProfileEntity> {
    const row = await this.prismaService.equipmentProfile.create({
      data: {
        userId: input.userId,
        name: input.name,
        equipment: {
          createMany: {
            data: input.equipment.map((equipment) => ({ equipment })),
          },
        },
      },
      include: { equipment: true },
    });

    return this.toEntity(row);
  }

  async update(
    userId: string,
    id: string,
    input: UpdateEquipmentProfileInput,
  ): Promise<EquipmentProfileEntity> {
    const existing = await this.prismaService.equipmentProfile.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (existing === null) {
      throw new EntityNotFoundError('EquipmentProfile', id);
    }

    await this.prismaService.equipmentProfile.update({
      where: { id: existing.id },
      data: {
        name: input.name,
      },
    });

    if (input.equipment !== undefined) {
      await this.prismaService.profileEquipmentItem.deleteMany({
        where: { equipmentProfileId: id },
      });

      if (input.equipment.length > 0) {
        await this.prismaService.profileEquipmentItem.createMany({
          data: input.equipment.map((equipment) => ({
            equipmentProfileId: id,
            equipment,
          })),
        });
      }
    }

    const updated = await this.prismaService.equipmentProfile.findUniqueOrThrow(
      {
        where: { id },
        include: { equipment: true },
      },
    );

    return this.toEntity(updated);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.prismaService.equipmentProfile.deleteMany({
      where: {
        id,
        userId,
      },
    });
  }

  async setActive(userId: string, id: string): Promise<void> {
    const existing = await this.prismaService.equipmentProfile.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (existing === null) {
      throw new EntityNotFoundError('EquipmentProfile', id);
    }

    await this.prismaService.$transaction([
      this.prismaService.equipmentProfile.updateMany({
        where: { userId },
        data: { isActive: false },
      }),
      this.prismaService.equipmentProfile.update({
        where: { id: existing.id },
        data: { isActive: true },
      }),
    ]);
  }

  private toEntity(row: {
    id: string;
    userId: string;
    name: string;
    isActive: boolean;
    isPreset: boolean;
    createdAt: Date;
    updatedAt: Date;
    equipment: Array<{ equipment: string }>;
  }): EquipmentProfileEntity {
    return new EquipmentProfileEntity({
      id: row.id,
      userId: row.userId,
      name: row.name,
      isActive: row.isActive,
      isPreset: row.isPreset,
      equipment: row.equipment.map((item) => item.equipment as EquipmentType),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
