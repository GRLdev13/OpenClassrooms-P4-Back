import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GetTagDto } from '../../tag/dtos/get-tag.dto';

export class GetFileDto {
  @IsUUID()
  public id: string;

  @IsString()
  public name: string;

  @IsDate()
  @IsNotEmpty()
  public uploadDate: Date;

  @IsDate()
  @IsNotEmpty()
  public expirationDate: Date;

  @IsBoolean()
  public hasExpired: boolean;

  @IsArray()
  public tags: GetTagDto[];

  @IsBoolean()
  public hasPassword: boolean;

  @IsOptional()
  @IsString()
  public link: string | null;

  constructor(
    id: string,
    name: string,
    uploadDate: Date,
    expirationDate: Date,
    hasExpired: boolean,
    tags: GetTagDto[],
    hasPassword: boolean,
    link: string | null,
  ) {
    this.id = id;
    this.name = name;
    this.uploadDate = uploadDate;
    this.expirationDate = expirationDate;
    this.hasExpired = hasExpired;
    this.tags = tags;
    this.hasPassword = hasPassword;
    this.link = link;
  }
}
