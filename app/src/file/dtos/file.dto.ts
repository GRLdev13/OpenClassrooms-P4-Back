export class FileDto {
  constructor(
    public id: string,
    public base64: string | null,
    public url: string | null,
    public hosting: string | null,
    public expirationDate: Date | null,
    public uploadDate: Date | null,
  ) {}
}
