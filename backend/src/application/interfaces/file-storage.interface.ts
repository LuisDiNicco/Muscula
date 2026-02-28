export const FILE_STORAGE_SERVICE = 'FILE_STORAGE_SERVICE';

export type UploadFileInput = {
  buffer: Buffer;
  contentType: string;
  fileName: string;
};

export interface IFileStorageService {
  upload(path: string, input: UploadFileInput): Promise<string>;
  getSignedUrl(path: string, expiresInSec: number): Promise<string>;
  delete(path: string): Promise<void>;
}
