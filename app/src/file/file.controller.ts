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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFileDto } from './dtos/createFile.dto';
import { GetFileDto } from './dtos/file.dto';
import { FileService } from './file.service';
import { type Express } from 'express';
import { FileValidator } from './validators/file.validator';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body(FileValidator) body: CreateFileDto,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ): Promise<GetFileDto[]> {
    console.log('File body parameters: ', body);
    //TODO: Set the "good data" of file name.
    //TODO: check file extensions and everything.
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

  @Get('by-id')
  async findById(@Query('id') id: string): Promise<GetFileDto> {
    return this.fileService.findById(id);
  }

  @Get('by-user-id')
  async findByUserId(@Query('id') id: string): Promise<GetFileDto[]> {
    return this.fileService.findByUserId(id);
  }

  @Get('all')
  async findAll(): Promise<GetFileDto[]> {
    return this.fileService.findAll();
  }

  @Get(':id')
  async downloadById(@Param('id') id: string): Promise<StreamableFile> {
    const dataFile = await this.fileService.downloadFileById(id);
    return new StreamableFile(dataFile);
  }

  @Delete('delete/:id')
  async deleteById(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.fileService.deleteById(id);
  }

  //TODO later: share file with another account.
  @Get('share-with')
  async shareWith(@Query('id') id: string): Promise<GetFileDto[]> {
    return this.fileService.findByUserId(id);
  }
}
