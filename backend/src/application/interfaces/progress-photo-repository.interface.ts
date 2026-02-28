import { ProgressPhotoEntity } from '../../domain/entities/progress-photo.entity';
import { PhotoCategory } from '../../domain/enums';

export const PROGRESS_PHOTO_REPOSITORY = 'PROGRESS_PHOTO_REPOSITORY';

export type CreateProgressPhotoInput = {
  category: PhotoCategory;
  date: Date;
  storagePath: string;
};

export type ListProgressPhotosFilters = {
  from?: Date;
  to?: Date;
  category?: PhotoCategory;
};

export interface IProgressPhotoRepository {
  create(
    userId: string,
    input: CreateProgressPhotoInput,
  ): Promise<ProgressPhotoEntity>;
  list(
    userId: string,
    filters: ListProgressPhotosFilters,
  ): Promise<ProgressPhotoEntity[]>;
  findById(
    userId: string,
    photoId: string,
  ): Promise<ProgressPhotoEntity | null>;
  delete(userId: string, photoId: string): Promise<void>;
}
