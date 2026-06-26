import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class DownloadFileLinkDto {
  @IsString()
  @IsNotEmpty()
  public link: string = '';

  @IsOptional()
  @IsString()
  public password?: string;
}
