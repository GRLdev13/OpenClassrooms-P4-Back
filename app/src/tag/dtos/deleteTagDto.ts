import { IsUUID } from 'class-validator';

export class DeleteTagDto {
  @IsUUID()
  public id: string = '';
}
