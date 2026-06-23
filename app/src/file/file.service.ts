import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { File } from '../../entities/file';
import { FileTag } from '../../entities/file-tag';
import { FileUser } from '../../entities/file-user';
import { Tag } from '../../entities/tag';
import { AuthService } from '../auth/auth.service';
import { CreateFileDto } from './dtos/createFile.dto';
import { CreateFileTagDto } from './dtos/createFileTagDto';
import { GetFileDto } from './dtos/getFileDto';
import { FileMapper } from './file.mapper';
import { UserService } from '../user/user.service';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly userService: UserService,
    private readonly fileMapper: FileMapper,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  async create(createFileDto: CreateFileDto): Promise<boolean> {
    if (createFileDto == null || !createFileDto.rawFile) {
      //todo better error
      throw new BadRequestException(`File payload is required`);
    }

    if (!createFileDto.email) {
      throw new BadRequestException(`File user reference is required`);
    }

    let userId = (await this.userService.findByEmail(createFileDto.email)).id;

    if (!userId) {
      throw new BadRequestException(`User not found somehow`);
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
      await this.fileRepository.manager.transaction(async (manager) => {
        const createdFile = await manager.save(File, file);
        createdFile.link = this.authService.generateLink(createdFile.id);
        await manager.save(File, createdFile);
        await this.linkFileToUser(manager, createdFile, userId);
        await this.tagsCustomMage(manager, createdFile, createFileDto.tags);
      });
    } catch (error) {
      throw new BadRequestException(`File failed samer: ` + error);
      return false;
    }
    return true;
  }

  private async linkFileToUser(
    manager: EntityManager,
    file: File,
    idUser: string,
  ): Promise<void> {
    const fileUser = new FileUser();
    fileUser.idFile = file.id;
    fileUser.idUser = idUser;
    fileUser.file = file;

    await manager.save(FileUser, fileUser);
  }

  async findById(id: string): Promise<GetFileDto> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: {
        fileTags: {
          tag: true,
        },
      },
    });

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
  ): Promise<Buffer> {
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

  async findByUserEmail(userEmail: string): Promise<GetFileDto[]> {
    const user = await this.userService.findByEmail(userEmail);

    return this.fileMapper.toDtoArray(user.fileUsers.map((x) => x.file));
  }

  async deleteById(id: string): Promise<{ deleted: boolean }> {
    const result = await this.fileRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`File with id ${id} not found`);
    }

    return { deleted: true };
  }

  //TODO: share a file with someone else
  async shareWith(userId: string): Promise<GetFileDto[]> {
    const files = await this.fileRepository
      .createQueryBuilder('file')
      .innerJoin('file.fileUsers', 'fileUser')
      .where('fileUser.idUser = :userId', { userId })
      .getMany();

    return this.fileMapper.toDtoArray(files);
  }

  private async tagsCustomMage(
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

      const fileTag = new FileTag();
      fileTag.idFile = file.id;
      fileTag.idTag = tag.id;
      fileTag.file = file;
      fileTag.tag = tag;

      await manager.save(FileTag, fileTag);
      linkedTagIds.add(tag.id);
    }
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

    const normalizedTags = tagArray.map((tag, index) => {
      if (typeof tag === 'string') {
        const name = tag.trim();

        if (!name) {
          throw new BadRequestException(`Tag at index ${index} is empty`);
        }

        return { id: '', name };
      }

      if (tag && typeof tag === 'object') {
        const value = tag as Record<string, unknown>;
        const id = typeof value.id === 'string' ? value.id.trim() : '';
        const name = typeof value.name === 'string' ? value.name.trim() : '';

        if (!id && !name) {
          throw new BadRequestException(
            `Tag at index ${index} must have an id or name`,
          );
        }

        return {
          id,
          name,
        };
      }

      throw new BadRequestException(`Invalid tag at index ${index}`);
    });

    return normalizedTags.filter(
      (tag, index, tags) =>
        tags.findIndex(
          (candidate) =>
            (tag.id !== '' && candidate.id === tag.id) ||
            (tag.name !== '' &&
              candidate.name.toLowerCase() === tag.name.toLowerCase()),
        ) === index,
    );
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
