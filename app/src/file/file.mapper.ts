import { Injectable } from '@nestjs/common';
import { File } from '../../entities/file';
import { FileDto } from './dtos/file.dto';

@Injectable()
export class FileMapper {

  toDto(file: File): FileDto {
    return new FileDto(
      file.id,
      file.rawData?.toString() ?? null,
      file.url,
      file.hosting,
      file.expirationDate,
      file.uploadDate,
      this.isFileExpired(file),
    );
  }

  toDtoArray(files: File[]): FileDto[] {
    return files.map((file) => this.toDto(file));
  }

  private isFileExpired(file: File): boolean {
    if (!file.expirationDate) {
      return false;
    }

    const expirationTime = file.expirationDate.getTime();

    //if expiration time set to infinity (unset)
    if (Number.isNaN(expirationTime)) {
      return false;
    }

    return expirationTime <= Date.now();
  }
}
