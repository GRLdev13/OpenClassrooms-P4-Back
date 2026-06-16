import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  StreamableFile,
} from '@nestjs/common';
import { CreateFileDto } from './dtos/create-file.dto';
import { FileDto } from './dtos/file.dto';
import { FileService } from './file.service';
import { createReadStream } from 'fs';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  async create(@Body() createFileDto: CreateFileDto): Promise<FileDto> {
    return this.fileService.create(createFileDto);
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
