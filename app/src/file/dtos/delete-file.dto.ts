import { IsUUID } from 'class-validator';

export class DeleteFileDto {
  @IsUUID()
  public id: string;

  constructor(id: string) {
    this.id = id;
  }
}
