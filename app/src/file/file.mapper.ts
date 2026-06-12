import { Injectable } from '@nestjs/common';
import { File } from '../../entities/file';
import { FileDto } from './dtos/file.dto';

@Injectable()
export class FileMapper {
  toDto(file: File): FileDto {
    return new FileDto(
      file.id,
      file.base64,
      file.url,
      file.hosting,
      file.expirationDate,
      file.uploadDate,
    );
  }

  toDtoArray(files: File[]): FileDto[] {
    return files.map((file) => this.toDto(file));
  }
}
