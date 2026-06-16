import {
  Body,
  Controller,
  Delete,
  Get,
  ParseFilePipe,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFileDto } from './dtos/create-file.dto';
import { FileDto } from './dtos/file.dto';
import { FileService } from './file.service';
import { createReadStream } from 'fs';
import { type Express } from 'express';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body() body: CreateFileDto,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ): Promise<FileDto> {

    console.log("File body parameters: ", body);
    //TODO: Set the "good data" of file name.
    //TODO: check file extensions and everything.
    return this.fileService.create({
      ...body,
      rawFile: file.buffer.toString('base64'),
    });
  }

  @Get('by-id')
  async findById(@Query('id') id: string): Promise<FileDto> {
    return this.fileService.findById(id);
  }

  @Get('by-user-id')
  async findByUserId(@Query('id') id: string): Promise<FileDto[]> {
    return this.fileService.findByUserId(id);
  }

  @Get('all')
  async findAll(): Promise<FileDto[]> {
    return this.fileService.findAll();
  }

  @Get('data-by-id')
  async downloadById(@Query('id') id: string): Promise<StreamableFile> {
    const dataFile = await this.fileService.downloadFileById(id);
    const file = createReadStream(dataFile);
    return new StreamableFile(file);
  }

  @Delete()
  async deleteById(@Query('id') id: string): Promise<{ deleted: boolean }> {
    return this.fileService.deleteById(id);
  }

  //TODO later: share file with another account.
  @Get('share-with')
  async shareWith(@Query('id') id: string): Promise<FileDto[]> {
    return this.fileService.findByUserId(id);
  }
}
