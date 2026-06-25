import { BadRequestException } from '@nestjs/common';
import { Files } from '../../entities/files';
import { FileTag } from '../../entities/file-tag';
import { FileUser } from '../../entities/file-user';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { CreateFileDto } from './dtos/create-file.dto';
import { FileMapper } from './file.mapper';
import { FileService } from './file.service';

describe('FileService upload creation', () => {
  let service: FileService;
  let fileRepository: {
    manager: {
      transaction: jest.Mock;
    };
  };
  let manager: {
    save: jest.Mock;
    getRepository: jest.Mock;
  };
  let tagRepository: {
    findOne: jest.Mock;
    createQueryBuilder: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let userService: {
    findByEmail: jest.Mock;
  };
  let fileMapper: FileMapper;
  let authService: {
    hashPassword: jest.Mock;
    generateLink: jest.Mock;
  };

  const validDto = (overrides: Partial<CreateFileDto> = {}): CreateFileDto =>
    ({
      name: 'notes.txt',
      extension: '.txt',
      rawFile: Buffer.from('file contents').toString('base64'),
      password: undefined,
      uploadDate: undefined,
      tags: [],
      expirationTimeInDay: 7,
      email: 'user@example.com',
      ...overrides,
    }) as CreateFileDto;

  beforeEach(() => {
    let tagId = 0;

    tagRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }),
      create: jest.fn((tag) => tag),
      save: jest.fn(async (tag) => ({
        id: `created-tag-id-${++tagId}`,
        ...tag,
      })),
    };

    manager = {
      save: jest.fn(async (_target, entity) => {
        if (entity instanceof Files && !entity.id) {
          entity.id = 'file-id';
        }

        return entity;
      }),
      getRepository: jest.fn().mockReturnValue(tagRepository),
    };

    fileRepository = {
      manager: {
        transaction: jest.fn(async (callback) => callback(manager)),
      },
    };

    userService = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'user-id' }),
    };

    fileMapper = new FileMapper();

    authService = {
      hashPassword: jest.fn().mockReturnValue('hashed-password'),
      generateLink: jest.fn().mockReturnValue('generated-link'),
    };

    service = new FileService(
      fileRepository as never,
      userService as unknown as UserService,
      fileMapper,
      authService as unknown as AuthService,
    );
  });

  it('rejects missing raw file payloads', async () => {
    await expect(service.create(validDto({ rawFile: '' }))).rejects.toThrow(
      new BadRequestException('File payload is required'),
    );

    expect(fileRepository.manager.transaction).not.toHaveBeenCalled();
  });

  it('rejects missing user email references', async () => {
    await expect(service.create(validDto({ email: '' }))).rejects.toThrow(
      new BadRequestException('File user reference is required'),
    );

    expect(userService.findByEmail).not.toHaveBeenCalled();
    expect(fileRepository.manager.transaction).not.toHaveBeenCalled();
  });

  it('saves the uploaded file, generates a link, and links it to the user', async () => {
    await expect(service.create(validDto())).resolves.toBe(true);

    expect(userService.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(fileRepository.manager.transaction).toHaveBeenCalledTimes(1);
    expect(authService.generateLink).toHaveBeenCalledWith('file-id');
    expect(manager.save).toHaveBeenCalledWith(FileUser, expect.objectContaining({
      idFile: 'file-id',
      idUser: 'user-id',
    }));
  });

  it('stores a hashed password when an upload password is provided', async () => {
    await service.create(validDto({ password: 'secret123' }));

    const savedFile = manager.save.mock.calls.find(
      ([target]) => target === Files,
    )?.[1] as Files;

    expect(authService.hashPassword).toHaveBeenCalledWith('secret123');
    expect(savedFile.password).toBe('hashed-password');
    expect(savedFile.password).not.toBe('secret123');
  });

  it('normalizes tags and saves one file-tag relation per unique tag', async () => {
    await service.create(
      validDto({
        tags: JSON.stringify([
          { name: 'Project' },
          { name: 'project' },
          'Urgent',
        ]),
      }),
    );

    const fileTagSaves = manager.save.mock.calls.filter(
      ([target]) => target === FileTag,
    );

    expect(tagRepository.save).toHaveBeenCalledTimes(2);
    expect(fileTagSaves).toHaveLength(2);
  });

  it('calculates the expiration date from uploadDate and expirationTimeInDay', async () => {
    await service.create(
      validDto({
        uploadDate: '2026-06-24T10:00:00.123Z',
        expirationTimeInDay: 7,
      }),
    );

    const savedFile = manager.save.mock.calls.find(
      ([target]) => target === Files,
    )?.[1] as Files;

    expect(savedFile.uploadDate?.toISOString()).toBe(
      '2026-06-24T10:00:00.123Z',
    );
    expect(savedFile.expirationDate?.toISOString()).toBe(
      '2026-07-01T10:00:00.000Z',
    );
  });

  it('rejects invalid upload dates', async () => {
    await expect(
      service.create(validDto({ uploadDate: 'not-a-date' })),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.create(validDto({ uploadDate: 'not-a-date' })),
    ).rejects.toThrow('Invalid date format');
  });
});
