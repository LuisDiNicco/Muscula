import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import {
  IFileStorageService,
  UploadFileInput,
} from '../../../application/interfaces/file-storage.interface';
import { ValidationError } from '../../../domain/errors/validation.error';

@Injectable()
export class SupabaseStorageService implements IFileStorageService {
  private readonly supabaseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') ?? '';
    this.serviceRoleKey =
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    this.bucket =
      this.configService.get<string>('SUPABASE_STORAGE_BUCKET') ??
      'progress-photos';
  }

  async upload(path: string, input: UploadFileInput): Promise<string> {
    this.assertConfigured();

    const contentType = input.contentType.toLowerCase();
    const targetFormat = contentType.includes('png') ? 'png' : 'jpeg';

    const transformed = sharp(input.buffer).rotate().resize({
      width: 1920,
      height: 1920,
      fit: 'inside',
      withoutEnlargement: true,
    });

    let outputBuffer: Buffer;
    let outputContentType: string;

    if (targetFormat === 'png') {
      outputBuffer = await transformed.png({ compressionLevel: 9 }).toBuffer();
      outputContentType = 'image/png';
    } else {
      outputBuffer = await transformed.jpeg({ quality: 85 }).toBuffer();
      outputContentType = 'image/jpeg';

      if (outputBuffer.byteLength > 1_000_000) {
        outputBuffer = await sharp(input.buffer)
          .rotate()
          .resize({
            width: 1920,
            height: 1920,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality: 70 })
          .toBuffer();
      }
    }

    if (outputBuffer.byteLength > 1_000_000) {
      throw new ValidationError(
        'Image exceeds 1MB after compression. Please upload a smaller image',
      );
    }

    const uploadUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${encodeURI(path)}`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.serviceRoleKey}`,
        apikey: this.serviceRoleKey,
        'Content-Type': outputContentType,
        'x-upsert': 'true',
      },
      body: new Uint8Array(outputBuffer),
    });

    if (!response.ok) {
      throw new ValidationError('Failed to upload progress photo to storage');
    }

    return path;
  }

  async getSignedUrl(path: string, expiresInSec: number): Promise<string> {
    this.assertConfigured();

    const signUrl = `${this.supabaseUrl}/storage/v1/object/sign/${this.bucket}/${encodeURI(path)}`;
    const response = await fetch(signUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.serviceRoleKey}`,
        apikey: this.serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        expiresIn: Math.max(1, expiresInSec),
      }),
    });

    if (!response.ok) {
      throw new ValidationError(
        'Failed to create signed URL for progress photo',
      );
    }

    const body = (await response.json()) as { signedURL?: string };
    if (body.signedURL === undefined) {
      throw new ValidationError('Signed URL response from storage is invalid');
    }

    return `${this.supabaseUrl}/storage/v1${body.signedURL}`;
  }

  async delete(path: string): Promise<void> {
    this.assertConfigured();

    const deleteUrl = `${this.supabaseUrl}/storage/v1/object/${this.bucket}/${encodeURI(path)}`;
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.serviceRoleKey}`,
        apikey: this.serviceRoleKey,
      },
    });

    if (!response.ok && response.status !== 404) {
      throw new ValidationError('Failed to delete progress photo from storage');
    }
  }

  private assertConfigured(): void {
    if (this.supabaseUrl.length === 0 || this.serviceRoleKey.length === 0) {
      throw new ValidationError(
        'Supabase storage is not configured. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      );
    }
  }
}
