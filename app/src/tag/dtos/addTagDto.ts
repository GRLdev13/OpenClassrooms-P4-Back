import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class AddTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  public name: string = '';
}
