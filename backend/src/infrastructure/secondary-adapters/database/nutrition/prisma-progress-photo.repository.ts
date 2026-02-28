import { Injectable } from '@nestjs/common';
import { PhotoCategory as PrismaPhotoCategory } from '@prisma/client';
import {
  CreateProgressPhotoInput,
  IProgressPhotoRepository,
  ListProgressPhotosFilters,
} from '../../../../application/interfaces/progress-photo-repository.interface';
import { ProgressPhotoEntity } from '../../../../domain/entities/progress-photo.entity';
import { PhotoCategory } from '../../../../domain/enums';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaProgressPhotoRepository implements IProgressPhotoRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    userId: string,
    input: CreateProgressPhotoInput,
  ): Promise<ProgressPhotoEntity> {
    const row = await this.prismaService.progressPhoto.create({
      data: {
        userId,
        category: input.category as unknown as PrismaPhotoCategory,
        date: input.date,
        fileUrl: input.storagePath,
        fileSizeBytes: 0,
      },
    });

    return this.toEntity(row);
  }

  async list(
    userId: string,
    filters: ListProgressPhotosFilters,
  ): Promise<ProgressPhotoEntity[]> {
    const rows = await this.prismaService.progressPhoto.findMany({
      where: {
        userId,
        category:
          filters.category === undefined
            ? undefined
            : (filters.category as unknown as PrismaPhotoCategory),
        date: {
          gte: filters.from,
          lte: filters.to,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return rows.map((row) => this.toEntity(row));
  }

  async findById(
    userId: string,
    photoId: string,
  ): Promise<ProgressPhotoEntity | null> {
    const row = await this.prismaService.progressPhoto.findFirst({
      where: {
        id: photoId,
        userId,
      },
    });

    if (row === null) {
      return null;
    }

    return this.toEntity(row);
  }

  async delete(userId: string, photoId: string): Promise<void> {
    await this.prismaService.progressPhoto.deleteMany({
      where: {
        id: photoId,
        userId,
      },
    });
  }

  private toEntity(row: {
    id: string;
    userId: string;
    category: string;
    date: Date;
    fileUrl: string;
    createdAt: Date;
  }): ProgressPhotoEntity {
    return new ProgressPhotoEntity({
      id: row.id,
      userId: row.userId,
      category: row.category as PhotoCategory,
      takenAt: row.date,
      storagePath: row.fileUrl,
      createdAt: row.createdAt,
      deletedAt: null,
    });
  }
}
