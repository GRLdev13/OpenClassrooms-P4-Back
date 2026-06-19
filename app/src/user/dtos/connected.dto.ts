import { GetFileDto } from '../../file/dtos/getFileDto';

export class ConnectedDto {
  constructor(
    public id: string,
    public email: string,
    public firstname: string,
    public lastname: string,
    public token: string,
    public files: GetFileDto[] = [],
    public picture = '',
  ) {}
}
