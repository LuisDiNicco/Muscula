import { Inject, Injectable } from '@nestjs/common';
import {
  FILE_STORAGE_SERVICE,
  type IFileStorageService,
  UploadFileInput,
} from '../interfaces/file-storage.interface';
import {
  type IProgressPhotoRepository,
  PROGRESS_PHOTO_REPOSITORY,
} from '../interfaces/progress-photo-repository.interface';
import { PhotoCategory } from '../../domain/enums';
import { EntityNotFoundError } from '../../domain/errors/entity-not-found.error';

@Injectable()
export class ProgressPhotoService {
  constructor(
    @Inject(PROGRESS_PHOTO_REPOSITORY)
    private readonly progressPhotoRepository: IProgressPhotoRepository,
    @Inject(FILE_STORAGE_SERVICE)
    private readonly fileStorageService: IFileStorageService,
  ) {}

  async uploadPhoto(
    userId: string,
    input: UploadFileInput,
    date: Date,
    category: PhotoCategory,
  ): Promise<{ photoId: string; url: string }> {
    const storagePath = `progress/${userId}/${date.toISOString().slice(0, 10)}-${category}-${input.fileName}`;
    const uploadedPath = await this.fileStorageService.upload(
      storagePath,
      input,
    );

    const created = await this.progressPhotoRepository.create(userId, {
      category,
      date,
      storagePath: uploadedPath,
    });

    return {
      photoId: created.id,
      url: await this.fileStorageService.getSignedUrl(uploadedPath, 86400),
    };
  }

  async getPhotos(
    userId: string,
    filters: {
      from?: Date;
      to?: Date;
      category?: PhotoCategory;
    },
  ): Promise<Array<{ id: string; category: PhotoCategory; url: string }>> {
    const photos = await this.progressPhotoRepository.list(userId, filters);

    return Promise.all(
      photos.map(async (photo) => ({
        id: photo.id,
        category: photo.category,
        url: await this.fileStorageService.getSignedUrl(
          photo.storagePath,
          86400,
        ),
      })),
    );
  }

  async deletePhoto(userId: string, photoId: string): Promise<void> {
    const photo = await this.progressPhotoRepository.findById(userId, photoId);
    if (photo === null) {
      throw new EntityNotFoundError('ProgressPhoto', photoId);
    }

    await this.fileStorageService.delete(photo.storagePath);
    await this.progressPhotoRepository.delete(userId, photoId);
  }
}
