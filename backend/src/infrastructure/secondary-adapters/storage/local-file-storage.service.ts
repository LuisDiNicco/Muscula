import { Injectable } from '@nestjs/common';
import {
  IFileStorageService,
  UploadFileInput,
} from '../../../application/interfaces/file-storage.interface';

@Injectable()
export class LocalFileStorageService implements IFileStorageService {
  upload(path: string, input: UploadFileInput): Promise<string> {
    void input;
    return Promise.resolve(path);
  }

  getSignedUrl(path: string, expiresInSec: number): Promise<string> {
    void expiresInSec;
    return Promise.resolve(path);
  }

  delete(path: string): Promise<void> {
    void path;
    return Promise.resolve();
  }
}
