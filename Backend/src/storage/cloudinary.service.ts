import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly kycFolder: string;
  private readonly productsFolder: string;

  constructor(private readonly config: ConfigService) {
    const cloudName = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.config.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.config.get<string>('CLOUDINARY_API_SECRET');
    this.kycFolder = this.config.get<string>(
      'CLOUDINARY_KYC_FOLDER',
      'skill-link/kyc',
    );
    this.productsFolder = this.config.get<string>(
      'CLOUDINARY_PRODUCTS_FOLDER',
      'skill-link/products',
    );

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.warn(
        'Cloudinary env vars missing (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Uploads will fail until configured.',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadKycDocument(
    buffer: Buffer,
  ): Promise<{ secureUrl: string; publicId: string }> {
    return this.uploadBuffer(buffer, {
      folder: this.kycFolder,
      tags: ['kyc', 'worker-document'],
      errorCode: 'KYC_STORAGE_ERROR',
      errorMessage: 'Document upload to storage failed',
    });
  }

  async uploadProductImage(
    buffer: Buffer,
  ): Promise<{ secureUrl: string; publicId: string }> {
    return this.uploadBuffer(buffer, {
      folder: this.productsFolder,
      tags: ['product', 'product-image'],
      errorCode: 'PRODUCT_IMAGE_STORAGE_ERROR',
      errorMessage: 'Product image upload to storage failed',
    });
  }

  private async uploadBuffer(
    buffer: Buffer,
    opts: {
      folder: string;
      tags: string[];
      errorCode: string;
      errorMessage: string;
    },
  ): Promise<{ secureUrl: string; publicId: string }> {
    try {
      return await new Promise<{ secureUrl: string; publicId: string }>(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: opts.folder,
              resource_type: 'auto',
              use_filename: true,
              unique_filename: true,
              tags: opts.tags,
            },
            (err, result) => {
              if (err) {
                const failure: Error =
                  err instanceof Error
                    ? err
                    : new Error(
                        typeof err === 'string'
                          ? err
                          : 'Cloudinary upload failed',
                      );
                this.logger.error(failure.message);
                return reject(failure);
              }
              if (!result?.secure_url || !result.public_id) {
                return reject(new Error('Cloudinary returned no URL'));
              }
              resolve({
                secureUrl: result.secure_url,
                publicId: result.public_id,
              });
            },
          );

          const stream = Readable.from(buffer);
          stream.on('error', (e: unknown) => {
            reject(e instanceof Error ? e : new Error('Upload stream error'));
          });
          stream.pipe(uploadStream);
        },
      );
    } catch (err: unknown) {
      this.logger.error(err);
      throw new InternalServerErrorException({
        message: opts.errorMessage,
        code: opts.errorCode,
      });
    }
  }
}
