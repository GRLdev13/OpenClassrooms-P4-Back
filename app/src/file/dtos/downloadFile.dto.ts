export class DownloadFileDto {
  constructor(
    public id: string,
    public uploadDate: Date | null,
    public rawData: Buffer | Buffer<ArrayBufferLike> | null,
  ) {}
}
