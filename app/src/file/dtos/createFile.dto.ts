export class CreateFileDto {
  constructor(
    public name: string = "",
    public extension?: string,
    public rawFile: string = "",
    public password?: string | null,
    public expirationDate?: Date | string | null,
    public uploadDate?: Date | string | null,
  ) {}
}
