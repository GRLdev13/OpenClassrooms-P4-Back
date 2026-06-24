import { GetTagDto } from "../../tag/dtos/get-tag.dto";

export class GetFileDto {
  constructor(
    public id: string,
    public name: string,
    public uploadDate: Date | null,
    public expirationDate: Date | null,
    public hasExpired: boolean,
    public tags: GetTagDto[],
    public hasPassword: boolean,
    public link: string | null
  ) {}
}
