import { IsOptional, IsString, IsUUID } from 'class-validator';

export class DownloadFileRequestDto {
  @IsUUID()
  public id: string = "";

  @IsOptional()
  @IsString()
  public password?: string;

  @IsOptional()
  @IsString()
  public token?: string;
}
