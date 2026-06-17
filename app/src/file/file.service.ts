import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../../entities/file';
import { AuthService } from '../auth/auth.service';
import { CreateFileDto } from './dtos/createFile.dto';
import { GetFileDto } from './dtos/file.dto';
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

  async create(createFileDto: CreateFileDto): Promise<boolean> {
    if (createFileDto == null) {
      //todo better error
      throw new NotFoundException('File payload is required');
    }

    try {
      const file = new File();
      file.name = createFileDto.name;
      file.rawData = this.fileMapper.toBlob(createFileDto.rawFile);
      file.password = createFileDto.password
        ? this.authService.hashPassword(createFileDto.password)
        : null;
      file.uploadDate = createFileDto.uploadDate
        ? this.toDateOrNull(createFileDto.uploadDate)
        : new Date();

      const expirationDate = new Date();
      expirationDate.setDate(
        expirationDate.getDate() + createFileDto.expirationTimeInDay,
      );

      file.expirationDate = expirationDate;
      await this.fileRepository.save(file);
    } catch (error) {
      return false;
    }
    return true;
  }

  async findById(id: string): Promise<GetFileDto> {
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
      throw new NotFoundException(
        `File with id ${id} has no raw data to be downloaded`,
      );
    }

    return file.rawData;
  }

  async findAll(): Promise<GetFileDto[]> {
    const files = await this.fileRepository.find();
    return this.fileMapper.toDtoArray(files);
  }

  async findByUserId(userId: string): Promise<GetFileDto[]> {
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
  async shareWith(
    userId: string,
    fileId: string,
    fileToken: string,
  ): Promise<GetFileDto[]> {
    //TODO: security with file token
    const files = await this.fileRepository
      .createQueryBuilder('file')
      .innerJoin('file.fileUsers', 'fileUser')
      .where('fileUser.idUser = :userId', { userId })
      .getMany();

    return this.fileMapper.toDtoArray(files);
  }

  private toDateOrNull(value: Date | string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return date;
  }
}
