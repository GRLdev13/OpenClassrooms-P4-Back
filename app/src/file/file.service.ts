import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../../entities/file';
import { CreateFileDto } from './dtos/create-file.dto';
import { FileDto } from './dtos/file.dto';
import { FileMapper } from './file.mapper';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly fileMapper: FileMapper,
  ) {}

  async create(createFileDto: CreateFileDto): Promise<FileDto> {
    const file = this.fileRepository.create({
      base64: createFileDto.base64 ?? null,
      url: createFileDto.url ?? null,
      hosting: createFileDto.hosting ?? null,
      expirationDate: this.toDateOrNull(createFileDto.expirationDate),
      uploadDate: this.toDateOrNull(createFileDto.uploadDate),
    });

    const savedFile = await this.fileRepository.save(file);
    return this.fileMapper.toDto(savedFile);
  }

  async findById(id: string): Promise<FileDto> {
    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }

    return this.fileMapper.toDto(file);
  }

  async findAll(): Promise<FileDto[]> {
    const files = await this.fileRepository.find();
    return this.fileMapper.toDtoArray(files);
  }

  async deleteById(id: string): Promise<{ deleted: boolean }> {
    const result = await this.fileRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`File with id ${id} not found`);
    }

    return { deleted: true };
  }

  private toDateOrNull(value: string | null | undefined): Date | null {
    return value ? new Date(value) : null;
  }
}
