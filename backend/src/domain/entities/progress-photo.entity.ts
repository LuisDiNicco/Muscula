import { PhotoCategory } from '../enums';

export type ProgressPhotoEntityProps = {
  id: string;
  userId: string;
  category: PhotoCategory;
  takenAt: Date;
  storagePath: string;
  createdAt: Date;
  deletedAt: Date | null;
};

export class ProgressPhotoEntity {
  constructor(private readonly props: ProgressPhotoEntityProps) {}

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get category(): PhotoCategory {
    return this.props.category;
  }

  get storagePath(): string {
    return this.props.storagePath;
  }
}
