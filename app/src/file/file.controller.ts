import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { CreateFileDto } from './dtos/create-file.dto';
import { FileDto } from './dtos/file.dto';
import { FileService } from './file.service';

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

  @Get('all')
  async findAll(): Promise<FileDto[]> {
    return this.fileService.findAll();
  }

  @Delete()
  async deleteById(@Query('id') id: string): Promise<{ deleted: boolean }> {
    return this.fileService.deleteById(id);
  }
}
