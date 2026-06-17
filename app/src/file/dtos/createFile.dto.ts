import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

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
  public tags?: CreateFileDto[] = [];

  @ValidateIf((o) => false)
  public expirationTimeInDay: number = 0;

  constructor(
    name: string = '',
    extension?: string,
    rawFile: string = '',
    tags: [] = [],
    password?: string | null,
    uploadDate?: Date | string | null,
    expirationTimeInDay: number = 0,
  ) {
    this.name = name;
    this.extension = extension;
    this.rawFile = rawFile;
    this.tags = tags;
    this.password = password;
    this.uploadDate = uploadDate;
    this.expirationTimeInDay = expirationTimeInDay;
  }
}
