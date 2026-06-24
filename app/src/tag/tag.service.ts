import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag';
import { AddTagDto } from './dtos/addTag.dto';
import { GetTagDto } from './dtos/getTag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async add(addTagDto: AddTagDto): Promise<GetTagDto> {
    const name = addTagDto?.name?.trim();

    if (!name) {
      throw new BadRequestException('Tag name is required');
    }

    if (name.length > 255) {
      throw new BadRequestException(
        'Tag name must contain at most 255 characters',
      );
    }

    const existingTag = await this.tagRepository
      .createQueryBuilder('tag')
      .where('LOWER(tag.name) = LOWER(:name)', { name })
      .getOne();

    if (existingTag) {
      throw new ConflictException(`Tag "${name}" already exists`);
    }

    const tag = this.tagRepository.create({ name });
    const savedTag = await this.tagRepository.save(tag);

    return this.toDto(savedTag);
  }

  async findAll(): Promise<GetTagDto[]> {
    const tags = await this.tagRepository.find({
      order: { name: 'ASC' },
    });

    return tags.map((tag) => this.toDto(tag));
  }

  async delete(id: string): Promise<{ deleted: boolean }> {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      throw new BadRequestException('A valid tag id is required');
    }

    const result = await this.tagRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`Tag with id ${id} not found`);
    }

    return { deleted: true };
  }

  private toDto(tag: Tag): GetTagDto {
    return new GetTagDto(tag.id, tag.name);
  }
}
