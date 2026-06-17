import { Injectable } from '@nestjs/common';
import { File } from '../../entities/file';
import { GetFileDto } from './dtos/file.dto';

@Injectable()
export class FileMapper {
  toDto(file: File): GetFileDto {
    return new GetFileDto(
      file.id,
      file.name ?? "unamed file",
      file.expirationDate,
      file.uploadDate,
      this.hasFileExpired(file?.expirationDate),
    );
  }

  toDtoArray(files: File[]): GetFileDto[] {
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
    return Buffer.from(file, 'base64');
  }
}
