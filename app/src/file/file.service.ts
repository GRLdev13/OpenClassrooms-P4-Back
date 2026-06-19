import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { EntityManager, Repository } from 'typeorm';
import { File } from '../../entities/file';
import { FileTag } from '../../entities/file-tag';
import { Tag } from '../../entities/tag';
import { AuthService } from '../auth/auth.service';
import { CreateFileDto } from './dtos/createFile.dto';
import { CreateFileTagDto } from './dtos/createFileTagDto';
import { GetFileDto } from './dtos/getFileDto';
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
      file.id = randomUUID();
      file.name = createFileDto.name;
      file.rawData = this.fileMapper.toBlob(createFileDto.rawFile);
      file.password = createFileDto.password
        ? this.authService.hashPassword(createFileDto.password)
        : null;
      file.uploadDate = createFileDto.uploadDate
        ? this.toDateOrNull(createFileDto.uploadDate)
        : new Date();
      file.link = this.authService.generateLink(file.id);

      const expirationDate = new Date();
      expirationDate.setDate(
        expirationDate.getDate() + createFileDto.expirationTimeInDay,
      );

      file.expirationDate = expirationDate;
      await this.fileRepository.manager.transaction(async (manager) => {
        await manager.save(File, file);
        await this.createFileTags(manager, file, createFileDto.tags);
      });
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

  async downloadFileById(
    id: string,
    password?: string,
    jwtToken?: string,
  ): Promise<Buffer> {
    // await this.authService.verifyToken(jwtToken);

    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException(`File with id ${id} not found`);
    }

    if (this.fileMapper.hasFileExpired(file.expirationDate)) {
      //TODO proper exception type
      throw new BadRequestException(`File with id ${id} has expired`);
    }

    if (
      file.password &&
      (!password || !this.authService.comparePassword(password, file.password))
    ) {
      throw new UnauthorizedException('Invalid file password');
    }

    if (!file.rawData || file.rawData.length === 0) {
      //TODO proper exception type
      throw new BadRequestException(
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
      .innerJoin(
        'file.fileUsers',
        'fileUser',
        'fileUser.idUser = :userId',
        { userId },
      )
      .leftJoinAndSelect('file.fileTags', 'fileTag')
      .leftJoinAndSelect('fileTag.tag', 'tag')
      .distinct(true)
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

  private async createFileTags(
    manager: EntityManager,
    file: File,
    rawTags?: CreateFileTagDto[] | string,
  ): Promise<void> {
    const tagInputs = this.normalizeTags(rawTags);
    const linkedTagIds = new Set<string>();

    for (const tagInput of tagInputs) {
      const tag = await this.findOrCreateTag(manager, tagInput);

      if (linkedTagIds.has(tag.id)) {
        continue;
      }

      const fileTag = manager.create(FileTag, {
        idFile: file.id,
        idTags: tag.id,
        file,
        tag,
      });

      await manager.save(FileTag, fileTag);
      linkedTagIds.add(tag.id);
    }
  }

  private async findOrCreateTag(
    manager: EntityManager,
    tagInput: CreateFileTagDto,
  ): Promise<Tag> {
    const tagRepository = manager.getRepository(Tag);
    const id = tagInput.id?.trim();
    const name = tagInput.name?.trim();

    if (id) {
      const tagById = await tagRepository.findOne({ where: { id } });

      if (tagById) {
        return tagById;
      }
    }

    if (!name) {
      throw new BadRequestException('Each tag must have a valid id or name');
    }

    const existingTag = await tagRepository
      .createQueryBuilder('tag')
      .where('LOWER(tag.name) = LOWER(:name)', { name })
      .getOne();

    if (existingTag) {
      return existingTag;
    }

    return tagRepository.save(tagRepository.create({ name }));
  }

  private normalizeTags(
    rawTags?: CreateFileTagDto[] | string,
  ): CreateFileTagDto[] {
    if (!rawTags) {
      return [];
    }

    let tags: unknown = rawTags;

    if (typeof rawTags === 'string') {
      const value = rawTags.trim();

      if (!value) {
        return [];
      }

      try {
        tags = JSON.parse(value);
      } catch {
        tags = [value];
      }
    }

    const tagArray: unknown[] = Array.isArray(tags) ? tags : [tags];

    return tagArray.map((tag) => {
      if (typeof tag === 'string') {
        return { name: tag };
      }

      if (tag && typeof tag === 'object') {
        const value = tag as Record<string, unknown>;
        return {
          id: typeof value.id === 'string' ? value.id : undefined,
          name: typeof value.name === 'string' ? value.name : undefined,
        };
      }

      throw new BadRequestException('Invalid tag value');
    });
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
