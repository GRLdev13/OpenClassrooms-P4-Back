import { Injectable } from '@nestjs/common';
import { File } from '../../entities/file';
import { FileDto } from './dtos/file.dto';

@Injectable()
export class FileMapper {
  toDto(file: File): FileDto {
    return new FileDto(
      file.id,
      file.rawData ?? null,
      file.expirationDate,
      file.uploadDate,
      this.hasFileExpired(file?.expirationDate),
    );
  }

  toDtoArray(files: File[]): FileDto[] {
    return files.map((file) => this.toDto(file));
  }

  hasFileExpired(expDate: Date | null): boolean {
    if (!expDate) {
      return false;
    }

    const expirationTime = expDate.getTime();

    //if expiration time set to infinity (unset)
    if (Number.isNaN(expirationTime)) {
      return false;
    }

    return expirationTime <= Date.now();
  }

  fromBlob(file: Buffer | null): string {
    return file ? file.toString('base64') : '';
  }

  toBlob(file: string): Buffer<ArrayBuffer> {
    return Buffer.from(file);
  }
}
