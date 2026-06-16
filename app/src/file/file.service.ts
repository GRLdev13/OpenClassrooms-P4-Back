import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../../entities/file';
import { AuthService } from '../auth/auth.service';
import { CreateFileDto } from './dtos/create-file.dto';
import { FileDto } from './dtos/file.dto';
import { FileMapper } from './file.mapper';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly fileMapper: FileMapper,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async create(createFileDto: CreateFileDto): Promise<FileDto> {
    const file = new File();
    file.rawData = createFileDto.rawFile
      ? this.fileMapper.toBlob(createFileDto.rawFile)
      : null;
    file.password = createFileDto.password
      ? this.authService.hashPassword(createFileDto.password)
      : null;
    file.uploadDate = this.toDateOrNull(createFileDto.uploadDate);
    file.expirationDate = this.toDateOrNull(createFileDto.expirationDate);

    const savedFile = await this.fileRepository.save(file);
    return this.fileMapper.toDto(savedFile);
  }

  async findById(id: string): Promise<FileDto> {
    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }

    if (this.fileMapper.hasFileExpired(file.expirationDate)) {
      //TODO proper exception
      throw new NotFoundException(`File with id ${id} has expired`);
    }

    return this.fileMapper.toDto(file);
  }

  async downloadFileById(id: string): Promise<Buffer> {
    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }

    if (this.fileMapper.hasFileExpired(file.expirationDate)) {
      //TODO proper exception type
      throw new NotFoundException(`File with id ${id} has expired`);
    }
    
    if (!file.rawData || file.rawData.length === 0) {
      //TODO proper exception type
      throw new NotFoundException(`File with id ${id} has no raw data to be downloaded`);
    }

    return file.rawData;
  }

  async findAll(): Promise<FileDto[]> {
    const files = await this.fileRepository.find();
    return this.fileMapper.toDtoArray(files);
  }

  async findByUserId(userId: string): Promise<FileDto[]> {
    const files = await this.fileRepository
      .createQueryBuilder('file')
      .innerJoin('file.fileUsers', 'fileUser')
      .where('fileUser.idUser = :userId', { userId })
      .getMany();

    return this.fileMapper.toDtoArray(files);
  }

  async deleteById(id: string): Promise<{ deleted: boolean }> {
    const result = await this.fileRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`File with id ${id} not found`);
    }

    return { deleted: true };
  }

  //TODO: share a file with someone else
  async shareWith(userId: string, fileId: string, fileToken:string): Promise<FileDto[]> {
    //TODO: security with file token
    const files = await this.fileRepository
      .createQueryBuilder('file')
      .innerJoin('file.fileUsers', 'fileUser')
      .where('fileUser.idUser = :userId', { userId })
      .getMany();

    return this.fileMapper.toDtoArray(files);
  }

  private toDateOrNull(value: string | null | undefined): Date | null {
    return value ? new Date(value) : null;
  }
}
