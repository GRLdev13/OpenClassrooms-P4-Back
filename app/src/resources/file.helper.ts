import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { FILE_RESOURCE_PATH } from './path.resource';
import { InternalServerErrorException } from '@nestjs/common';
import { unlink } from 'fs/promises';

export class FileHelper {
  private constructor() {}

  static EnsurePath(): void {
    if (existsSync(FILE_RESOURCE_PATH)) {
      return;
    }

    mkdirSync(FILE_RESOURCE_PATH, { recursive: true });
  }

  static CreateFileAtPath(fileData: Buffer, fileName: string) {
    try {
      this.EnsurePath();
      writeFileSync(join(FILE_RESOURCE_PATH, fileName), fileData);
    } catch {
      throw new InternalServerErrorException(
        `File ${fileName} Couldn't be saved on disk`,
      );
    }
  }

  static DeleteFileAtPath(fileName: string) {
    const fullfilePath= join(FILE_RESOURCE_PATH, fileName);
    console.log(fullfilePath);
    try {
      if (existsSync(fullfilePath)) {
        unlink(fullfilePath);
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Could not delete the file from disk',
      );
    }
  }
}
