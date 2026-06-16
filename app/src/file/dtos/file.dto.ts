export class FileDto {
  constructor(
    public id: string,
    public base64: string | null,
    public url: string | null,
    public hosting: string | null,
    public expirationDate: Date | null,
    public uploadDate: Date | null,
    public isFileExpired: boolean,
  ) {}
}

export class CreateFileDto {
  constructor(
    public id: string,
    public base64: string | null,
    public url: string | null,
    public hosting: string | null,
    public expirationDate: Date | null,
    public uploadDate: Date | null,
    public isFileExpired: boolean,
  ) {}
}

export class GetFileDto {
  constructor(
    public id: string,
    public base64: string | null,
    public url: string | null,
    public hosting: string | null,
    public expirationDate: Date | null,
    public uploadDate: Date | null,
    public isFileExpired: boolean,
  ) {}
}

export class DeleteFileDto {
  constructor(
    public id: string,
    public base64: string | null,
    public url: string | null,
    public hosting: string | null,
    public expirationDate: Date | null,
    public uploadDate: Date | null,
    public isFileExpired: boolean,
  ) {}
}