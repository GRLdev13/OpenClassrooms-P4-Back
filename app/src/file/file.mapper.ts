import { Injectable } from '@nestjs/common';
import { File } from '../../entities/file';
import { GetFileDto } from './dtos/get-file.dto';
import { GetTagDto } from '../tag/dtos/get-tag.dto';

@Injectable()
export class FileMapper {
  toDto(file: File): GetFileDto {
    return new GetFileDto(
      file.id,
      file.name ?? 'unnamed file',
      file.uploadDate,
      file.expirationDate,
      this.hasFileExpired(file.expirationDate),
      (file.fileTags ?? [])
        .filter((fileTag) => Boolean(fileTag.tag))
        .map(
          (fileTag) => new GetTagDto(fileTag.tag.id, fileTag.tag.name),
        ),
      Boolean(file.password),
      file.link,
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
