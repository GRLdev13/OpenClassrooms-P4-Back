import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { CreateFileTagDto } from './create-file-tag.dto';

export class CreateFileDto {
  // @IsString()
  // @IsNotEmpty()
  @ValidateIf((o) => false)
  public name: string;

  // @IsOptional()
  @ValidateIf((o) => false)
  // @IsString()
  public extension?: string;

  // @IsOptional()
  @ValidateIf((o) => false)
  // @IsString()
  public rawFile: string;

  // @IsOptional()
  @ValidateIf((o) => false)
  // @IsString()
  public password?: string | null;

  // @IsOptional()
  @ValidateIf((o) => false)
  // @IsDateString()
  public uploadDate?: Date | string | null;

  @ValidateIf((o) => false)
  public tags?: CreateFileTagDto[] = [];

  @ValidateIf((o) => false)
  public expirationTimeInDay: number = 0;

  @ValidateIf((o) => false)
  public email: string;

  constructor(
    name: string = '',
    extension?: string,
    rawFile: string = '',
    tags: CreateFileTagDto[] = [],
    password?: string | null,
    uploadDate?: Date | string | null,
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
