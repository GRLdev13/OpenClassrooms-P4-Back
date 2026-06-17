import { BadRequestException, Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import { CreateFileDto } from '../dtos/createFile.dto';

@Injectable()
export class FileValidator {
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

  async validateCreate(createFileDto: CreateFileDto): Promise<void> {
    const dto = Object.assign(new CreateFileDto(), createFileDto);
    const errors = await validate(dto);
    const forbiddenExtension = this.getForbiddenExtension(dto.extension);

    if (forbiddenExtension) {
      errors.push({
        property: 'extension',
        constraints: {
          forbiddenExtension: `${forbiddenExtension} files are not allowed`,
        },
      });
    }

    if (errors.length === 0) {
      return;
    }

    throw new BadRequestException({
      message: 'Invalid file payload',
      errors: errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      })),
    });
  }

  private getForbiddenExtension(extension?: string): string | null {
    if (!extension) {
      return null;
    }

    const normalizedExtension = extension.trim().toLowerCase();
    const extensionWithDot = normalizedExtension.startsWith('.')
      ? normalizedExtension
      : `.${normalizedExtension}`;

    return FileValidator.forbiddenExtensions.includes(extensionWithDot)
      ? extensionWithDot
      : null;
  }
}
