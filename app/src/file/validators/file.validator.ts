import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import { CreateFileDto } from '../dtos/create-file.dto';

@Injectable()
export class FileValidator extends ValidationPipe {
  static readonly forbiddenExtensions = [
    '.app',
    '.bat',
    '.cmd',
    '.com',
    '.cpl',
    '.dll',
    '.exe',
    '.gadget',
    '.hta',
    '.inf',
    '.ins',
    '.iso',
    '.jar',
    '.js',
    '.jse',
    '.lnk',
    '.msc',
    '.msi',
    '.msp',
    '.msix',
    '.pif',
    '.ps1',
    '.psd1',
    '.psm1',
    '.reg',
    '.scr',
    '.sh',
    '.sys',
    '.vb',
    '.vbe',
    '.vbs',
    '.ws',
    '.wsf',
    '.wsh',
  ];

  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
    });
  }

  async transform(value: CreateFileDto, metadata: ArgumentMetadata) {
    const transformedValue = await super.transform(value, metadata);
    const hasForbiddenExtension = FileValidator.getForbiddenExtension(
      transformedValue.extension,
    );

    if (hasForbiddenExtension) {
      throw new BadRequestException({
        message: 'Invalid file payload',
        errors: [
          {
            property: 'extension',
            constraints: {
              forbiddenExtension: `${transformedValue.extension} files are not allowed`,
            },
          },
        ],
      });
    }

    return transformedValue;
  }

  static getForbiddenExtension(extension?: string): boolean {
    if (!extension) {
      return false;
    }

    const normalizedExtension = extension.trim().toLowerCase();
    const extensionWithDot = normalizedExtension.startsWith('.')
      ? normalizedExtension
      : `.${normalizedExtension}`;

    return FileValidator.forbiddenExtensions.includes(extensionWithDot);
  }
}
