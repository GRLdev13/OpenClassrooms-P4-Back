import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateFileDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsOptional()
  @IsString()
  public extension?: string;

  @IsString()
  @IsNotEmpty()
  public rawFile: string;

  @IsOptional()
  @IsString()
  public password?: string | null;

  @IsOptional()
  @IsDateString()
  public expirationDate?: Date | string | null;

  @IsOptional()
  @IsDateString()
  public uploadDate?: Date | string | null;

  constructor(
    name: string = "",
    extension?: string,
    rawFile: string = "",
    password?: string | null,
    expirationDate?: Date | string | null,
    uploadDate?: Date | string | null,
  ) {
    this.name = name;
    this.extension = extension;
    this.rawFile = rawFile;
    this.password = password;
    this.expirationDate = expirationDate;
    this.uploadDate = uploadDate;
  }
}
