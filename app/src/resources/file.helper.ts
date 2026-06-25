import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { FILE_RESOURCE_PATH } from './path.resource';
import { BadRequestException } from '@nestjs/common';

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
          throw new BadRequestException(
                `File ${fileName} Couldn't be saved on disk`,
              );
    }
  }
}
