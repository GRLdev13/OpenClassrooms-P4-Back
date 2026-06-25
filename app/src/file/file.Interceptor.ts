import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { FileValidator } from './validators/file.validator';

export const FILE_UPLOAD_FIELD = 'file';
export const ONE_GIB_IN_BYTES = 1024 * 1024 * 1024;
export const MAX_FILE_SIZE_BYTES = ONE_GIB_IN_BYTES - 1;

export function isAllowedFileSize(sizeInBytes: number): boolean {
  return sizeInBytes < ONE_GIB_IN_BYTES;
}

export function createInvalidFileExtensionException(
  extension: string,
): BadRequestException {
  return new BadRequestException({
    message: `${extension} files are not allowed`,
  });
}

export function createFileTooLargeException(): BadRequestException {
  return new BadRequestException({
    message: `File size must be less than ${ONE_GIB_IN_BYTES} bytes`,
  });
}

const BaseFileInterceptor = FileInterceptor(FILE_UPLOAD_FIELD, {
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_request, file, callback) => {
    const fileExtension = extname(file.originalname);
    const hasForbiddenExtension =
      FileValidator.getForbiddenExtension(fileExtension);

    if (hasForbiddenExtension) {
      callback(createInvalidFileExtensionException(fileExtension), false);
      return;
    }

    callback(null, true);
  },
});

export class FileIntercepting extends BaseFileInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    try {
      return await super.intercept(context, next);
    } catch (error) {
      if (this.isFileSizeLimitError(error)) {
        throw createFileTooLargeException();
      }

      throw error;
    }
  }

  private isFileSizeLimitError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'LIMIT_FILE_SIZE'
    );
  }
}
