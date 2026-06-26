import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Tag } from '../../entities/tag';
import { TagService } from './tag.service';

describe('TagService', () => {
  let service: TagService;
  let queryBuilder: {
    where: jest.Mock;
    getOne: jest.Mock;
  };
  let tagRepository: {
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
  };

  const tagId = '54b6af70-8af5-4f3d-bd44-e68f66e91cf7';

  beforeEach(() => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    tagRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      create: jest.fn((tag) => tag),
      save: jest.fn(async (tag) => ({ id: tagId, ...tag })),
      find: jest.fn(),
      delete: jest.fn(),
    };

    service = new TagService(tagRepository as never);
  });

  it('adds a trimmed tag when no duplicate exists', async () => {
    await expect(service.add({ name: ' Project ' })).resolves.toEqual({
      id: tagId,
      name: 'Project',
    });

    expect(tagRepository.createQueryBuilder).toHaveBeenCalledWith('tag');
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'LOWER(tag.name) = LOWER(:name)',
      { name: 'Project' },
    );
    expect(tagRepository.create).toHaveBeenCalledWith({ name: 'Project' });
    expect(tagRepository.save).toHaveBeenCalledWith({ name: 'Project' });
  });

  it('rejects blank tag names', async () => {
    await expect(service.add({ name: '   ' })).rejects.toThrow(
      new BadRequestException('Tag name is required'),
    );

    expect(tagRepository.createQueryBuilder).not.toHaveBeenCalled();
    expect(tagRepository.save).not.toHaveBeenCalled();
  });

  it('rejects tag names longer than 255 characters', async () => {
    await expect(service.add({ name: 'a'.repeat(256) })).rejects.toThrow(
      new BadRequestException('Tag name must contain at most 255 characters'),
    );

    expect(tagRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('rejects duplicate tag names case-insensitively', async () => {
    queryBuilder.getOne.mockResolvedValue({ id: tagId, name: 'Project' });

    await expect(service.add({ name: 'project' })).rejects.toThrow(
      new ConflictException('Tag "project" already exists'),
    );

    expect(tagRepository.create).not.toHaveBeenCalled();
    expect(tagRepository.save).not.toHaveBeenCalled();
  });

  it('returns all tags ordered by name as DTOs', async () => {
    const tags = [
      { id: tagId, name: 'Project' },
      { id: 'a8408d60-44ac-4948-9bc0-1d62c462ee84', name: 'Urgent' },
    ] as Tag[];

    tagRepository.find.mockResolvedValue(tags);

    await expect(service.findAll()).resolves.toEqual(tags);
    expect(tagRepository.find).toHaveBeenCalledWith({
      order: { name: 'ASC' },
    });
  });

  it('deletes an existing tag', async () => {
    tagRepository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.delete(tagId)).resolves.toEqual({ deleted: true });
    expect(tagRepository.delete).toHaveBeenCalledWith(tagId);
  });

  it('rejects invalid tag ids before deleting', async () => {
    await expect(service.delete('not-a-uuid')).rejects.toThrow(
      new BadRequestException('A valid tag id is required'),
    );

    expect(tagRepository.delete).not.toHaveBeenCalled();
  });

  it('throws when the tag to delete does not exist', async () => {
    tagRepository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.delete(tagId)).rejects.toThrow(
      new NotFoundException(`Tag with id ${tagId} not found`),
    );
  });
});
