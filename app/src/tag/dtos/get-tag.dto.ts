import { IsString, IsUUID } from 'class-validator';

export class GetTagDto {
  @IsUUID()
  public id: string;

  @IsString()
  public name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
