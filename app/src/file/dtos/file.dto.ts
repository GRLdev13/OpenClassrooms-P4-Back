export class GetFileDto {
  constructor(
    public id: string,
    public name:string,
    public uploadDate: Date | null,
    public expirationDate: Date | null,
    public isFileExpired: boolean,
  ) {}
}

export class DeleteFileDto {
  constructor(
    public id: string,
  ) {}
}
  
export class DownloadFileDto {
  constructor(
    public id: string,
    public uploadDate: Date | null,
    public rawData: Buffer | Buffer<ArrayBufferLike> | null,
  ) {}
}