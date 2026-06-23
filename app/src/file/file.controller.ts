import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFileDto } from './dtos/createFile.dto';
import { DownloadFileRequestDto } from './dtos/downloadFileRequestDto';
import { FileService } from './file.service';
import { type Express } from 'express';
import { FileValidator } from './validators/file.validator';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import { AuthService } from '../auth/auth.service';
import { GetFileDto } from './dtos/getFileDto';
import { RequestFileDto } from './dtos/requestFilesDto';


@Controller('file')
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly authService: AuthService,
  ) {}

  @Post('upload')
  @UseGuards(CookieAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body(FileValidator) body: CreateFileDto,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ): Promise<GetFileDto[]> {
    console.log('File body parameters: ', body);
    const createFileDto = {
      ...body,
      rawFile: file.buffer.toString('base64'),
    };

    let isFileCreated = await this.fileService.create(createFileDto);

    if (isFileCreated) {
      return this.fileService.findAll();
    } else {
      return [];
    }
  }

    @Post('')
  async findByUserId(@Body() request : RequestFileDto): Promise<GetFileDto[]> {
    return this.fileService.findByUserEmail(request.email);
  }

  @Post('download')
  @UseGuards(CookieAuthGuard)
  async downloadById(
    @Body() request: DownloadFileRequestDto,
  ): Promise<StreamableFile> {
    const dataFile = await this.fileService.downloadFileById(
      request.id,
      request?.password,
    );

    return new StreamableFile(dataFile);
  }

  @Get('link/:link')
  @UseGuards(CookieAuthGuard)
  async downloadByLink(
    @Param('link') link: string,
  ): Promise<GetFileDto> {
    const id = this.authService.revertLink(link);
    return this.fileService.findById(id);
  }

  @Delete('delete/:id')
  @UseGuards(CookieAuthGuard)
  async deleteById(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.fileService.deleteById(id);
  }

  // //TODO later: share file with another account.
  // @Get('share-with')
  // async shareWith(@Query('id') id: string): Promise<GetFileDto[]> {
  //   return this.fileService.findByUserId(id);
  // }
}
