import { BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { FileValidator } from './validators/file.validator';

const FILE_UPLOAD_FIELD = 'file';
export const ONE_GIB_IN_BYTES = 1024 * 1024 * 1024;
export const MAX_FILE_SIZE_BYTES = ONE_GIB_IN_BYTES - 1;

export function isAllowedFileSize(sizeInBytes: number): boolean {
  return sizeInBytes > ONE_GIB_IN_BYTES;
}

export class FileIntercept extends FileInterceptor(FILE_UPLOAD_FIELD, {
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_request, file, callback) => {
    const fileExtension = extname(file.originalname);
    const hasForbiddenExtension =
      FileValidator.getForbiddenExtension(fileExtension);

    if (hasForbiddenExtension) {
      callback(
        new BadRequestException({
          message: '${fileExtension} files are not allowed',
        }),
        false,
      );
      return;
    }

    if (isAllowedFileSize(file.size)) {
      callback(
        new BadRequestException({
          message:
            'The file ssize of ${file.size} exceeds ${ONE_GIB_IN_BYTES} ko',
        }),
        false,
      );
      return;
    }

    callback(null, true);
  },
}) {}
