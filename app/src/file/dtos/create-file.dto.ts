import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { CreateFileTagDto } from './create-file-tag.dto';

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsNotEmpty()
  @IsString()
  public extension?: string;

  // Validated elsewhere by the FileInterceptor.
  @ValidateIf((o) => false)
  public rawFile: string;

  @IsOptional()
  @IsString()
  public password?: string | null;

  @IsOptional()
  @IsDateString()
  public uploadDate?: Date | string | null;

  @IsOptional()
  public tags?: CreateFileTagDto[] = [];

  @IsNotEmpty()
  public expirationTimeInDay: number = 0;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  constructor(
    name: string = '',
    extension?: string,
    rawFile: string = '',
    tags: CreateFileTagDto[] = [],
    password?: string | null,
    uploadDate?: Date | string,
    expirationTimeInDay: number = 0,
    email: string = '',
  ) {
    this.name = name;
    this.extension = extension;
    this.rawFile = rawFile;
    this.tags = tags;
    this.password = password;
    this.uploadDate = uploadDate;
    this.expirationTimeInDay = expirationTimeInDay;
    this.email = email;
  }
}
