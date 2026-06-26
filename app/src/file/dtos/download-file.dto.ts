import { IsArray, IsDate, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { isArrayBuffer } from 'util/types';

export class DownloadFileDto {
  @IsUUID()
  @IsNotEmpty()
  public id: string;

  @IsDate()
  @IsNotEmpty()
  public uploadDate: Date;

  @IsNotEmpty()
  public rawData: Buffer | Buffer<ArrayBufferLike>;

  constructor(
    id: string,
    uploadDate: Date,
    rawData: Buffer | Buffer<ArrayBufferLike>,
  ) {
    this.id = id;
    this.uploadDate = uploadDate;
    this.rawData = rawData;
  }
}
