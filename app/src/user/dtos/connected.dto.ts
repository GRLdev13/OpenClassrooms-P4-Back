import { GetFileDto } from '../../file/dtos/getFile.dto';

export class ConnectedDto {
  constructor(
    public id: string,
    public email: string,
    public firstName: string,
    public lastName: string,
    public files: GetFileDto[] = [],
    public picture = '',
  ) {}
}
