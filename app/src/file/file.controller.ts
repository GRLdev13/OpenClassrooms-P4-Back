import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { CreateFileDto } from './dtos/create-file.dto';
import { DownloadFileRequestDto } from './dtos/download-file-request.dto';
import { FileService } from './file.service';
import { type Express } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';
import { FileValidator } from './validators/file.validator';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import { AuthService } from '../auth/auth.service';
import { GetFileDto } from './dtos/get-file.dto';
import { FileIntercepting } from './file.Interceptor';

@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly authService: AuthService,
  ) {}

  @Post('upload')
  @UseGuards(CookieAuthGuard)
  @UseInterceptors(FileIntercepting)
  async uploadFile(
    @Req() request: Request,
    @Body(FileValidator) body: CreateFileDto,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ): Promise<GetFileDto[]> {
    performance.mark('upload-start');

    const userMail = await this.authService.getSecuredEmail(request);
    //TODO: change in file stream
    const createFileDto = {
      ...body,
    };
    
    let isFileCreated = await this.fileService.create(
      createFileDto,
      file.buffer,
      userMail
    );

    performance.mark('upload-end');
    performance.measure('download endpoint', 'upload-start', 'upload-end');

    if (isFileCreated) {
      return this.fileService.findAll();
    } else {
      return [];
    }
  }

  @Get('files')
  // @UseGuards(CookieAuthGuard)
  async getFiles(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<GetFileDto[]> {
    response.status(200);
    const userMail = await this.authService.getSecuredEmail(request);
    return this.fileService.findByUserEmail(userMail);
  }

  @Post('download')
  @UseGuards(CookieAuthGuard)
  async downloadById(
    @Body(new ValidationPipe()) request: DownloadFileRequestDto,
  ): Promise<StreamableFile> {
    const dataFile = await this.fileService.downloadFileById(
      request.id,
      request?.password,
    );

    return new StreamableFile(dataFile);
  }

  //Optionnal anonymous download route
  @Post('download/anonymous')
  async anonDownloadById(
    @Body(new ValidationPipe()) request: DownloadFileRequestDto,
  ): Promise<StreamableFile> {
    const dataFile = await this.fileService.downloadFileById(
      request.id,
      request?.password,
    );

    return new StreamableFile(dataFile);
  }

  //TODO: If anonymous user do not check for auth guard or something
  @Get('link/:link')
  @UseGuards(CookieAuthGuard)
  async downloadByLink(@Param('link') link: string): Promise<GetFileDto> {
    const id = this.authService.revertLink(link);
    return this.fileService.findById(id);
  }

  @Delete('delete/:id')
  @UseGuards(CookieAuthGuard)
  async deleteById(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.fileService.deleteById(id);
  }
}
