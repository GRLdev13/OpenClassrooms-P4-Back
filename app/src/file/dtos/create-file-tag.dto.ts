import { IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';

export class CreateFileTagDto {
  @IsUUID()
  @IsNotEmpty()
  public id!: string;

  @IsString()
  @IsNotEmpty()
  public name!: string;
}
