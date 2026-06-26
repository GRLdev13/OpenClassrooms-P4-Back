import { IsArray, IsEmail, isEmpty, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { GetFileDto } from '../../file/dtos/get-file.dto';

export class ConnectedDto {
  @IsUUID()
  public id: string;

  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public firstName: string;

  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @IsArray()
  public files: GetFileDto[] = [];

  @IsString()
  public picture = '';

  constructor(
    id: string,
    email: string,
    firstName: string,
    lastName: string,
    files: GetFileDto[] = [],
    picture = '',
  ) {
    this.id = id;
    this.email = email;
    this.firstName = firstName;
    this.lastName = lastName;
    this.files = files;
    this.picture = picture;
  }
}
