jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

import { BadRequestException } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { Files } from '../../entities/files';
import { FileTag } from '../../entities/file-tag';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { CreateFileDto } from './dtos/create-file.dto';
import { FileMapper } from './file.mapper';
import { FileService } from './file.service';
import { FileHelper } from '@/resources/file.helper';

describe('FileService upload creation', () => {
  let service: FileService;
  let fileBuffer: Buffer;
  let fileRepository: {
    manager: {
      transaction: jest.Mock;
    };
    findOne: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
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
    comparePassword: jest.Mock;
  };

  const fileId = '54b6af70-8af5-4f3d-bd44-e68f66e91cf7';
  const futureDate = () => new Date(Date.now() + 60_000);
  const userEmail = 'user@example.com';
  const fileEntity = (overrides: Partial<Files> = {}): Files =>
    ({
      id: fileId,
      name: 'notes.txt',
      uploadDate: new Date('2026-06-24T10:00:00.123Z'),
      expirationDate: futureDate(),
      password: null,
      physicalName: 'physical-file-name',
      link: 'generated-link',
      fileTags: [],
      ...overrides,
    }) as Files;

  const validDto = (overrides: Partial<CreateFileDto> = {}): CreateFileDto =>
    ({
      name: 'notes.txt',
      extension: '.txt',
      rawFile: Buffer.from('file contents').toString('base64'),
      password: undefined,
      uploadDate: undefined,
      tags: [],
      expirationTimeInDay: 7,
      ...overrides,
    }) as CreateFileDto;

  beforeEach(() => {
    let tagId = 0;
    fileBuffer = Buffer.from('file contents');

    jest.spyOn(FileHelper, 'CreateFileAtPath').mockImplementation(() => {});

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
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }),
    };

    userService = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'user-id' }),
    };

    fileMapper = new FileMapper();

    authService = {
      hashPassword: jest.fn().mockReturnValue('hashed-password'),
      generateLink: jest.fn().mockReturnValue('generated-link'),
      comparePassword: jest.fn(),
    };

    service = new FileService(
      fileRepository as never,
      userService as unknown as UserService,
      fileMapper,
      authService as unknown as AuthService,
    );

    (readFile as jest.Mock).mockReset();
    jest.spyOn(FileHelper, 'DeleteFileAtPath').mockImplementation(() => {});
  });

  it('rejects missing raw file payloads', async () => {
    await expect(service.create(validDto(), undefined as never)).rejects.toThrow(
      new BadRequestException('File payload is required'),
    );

    expect(fileRepository.manager.transaction).not.toHaveBeenCalled();
  });

  it('rejects missing user email references', async () => {
    await expect(
      service.create(validDto(), fileBuffer, ''),
    ).rejects.toThrow(new BadRequestException('File user reference is required'));

    expect(userService.findByEmail).not.toHaveBeenCalled();
    expect(fileRepository.manager.transaction).not.toHaveBeenCalled();
  });

  it('rejects missing users', async () => {
    userService.findByEmail.mockResolvedValue(null);

    await expect(service.create(validDto(), fileBuffer, userEmail)).rejects.toThrow(
      new BadRequestException('User not found somehow'),
    );

    expect(fileRepository.manager.transaction).not.toHaveBeenCalled();
  });

  it('saves the uploaded file, generates a link, and links it to the user', async () => {
    await expect(service.create(validDto(), fileBuffer, userEmail)).resolves.toBe(true);

    expect(userService.findByEmail).toHaveBeenCalledWith('user@example.com');
    expect(fileRepository.manager.transaction).toHaveBeenCalledTimes(1);
    expect(authService.generateLink).toHaveBeenCalledWith('file-id');
    expect(FileHelper.CreateFileAtPath).toHaveBeenCalledWith(
      fileBuffer,
      expect.any(String),
    );
    expect(manager.save).toHaveBeenCalledWith(
      Files,
      expect.objectContaining({
        id: 'file-id',
        user: { id: 'user-id' },
      }),
    );
  });

  it('stores a hashed password when an upload password is provided', async () => {
    await service.create(validDto({ password: 'secret123' }), fileBuffer, userEmail);

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
      fileBuffer,
      userEmail,
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
      fileBuffer,
      userEmail,
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
      service.create(validDto({ uploadDate: 'not-a-date' }), fileBuffer, userEmail),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.create(validDto({ uploadDate: 'not-a-date' }), fileBuffer, userEmail),
    ).rejects.toThrow('Invalid date format');
  });

  it('wraps transaction failures during creation', async () => {
    fileRepository.manager.transaction.mockRejectedValue(new Error('db failed'));

    await expect(service.create(validDto(), fileBuffer, userEmail)).rejects.toThrow(
      'File failed samer: Error: db failed',
    );
  });

  it('finds a file by id and maps it to a DTO', async () => {
    fileRepository.findOne.mockResolvedValue(
      fileEntity({
        fileTags: [
          {
            tag: {
              id: 'a8408d60-44ac-4948-9bc0-1d62c462ee84',
              name: 'Project',
            },
          },
        ],
      }),
    );

    await expect(service.findById(fileId)).resolves.toEqual(
      expect.objectContaining({
        id: fileId,
        name: 'notes.txt',
        hasExpired: false,
        tags: [
          {
            id: 'a8408d60-44ac-4948-9bc0-1d62c462ee84',
            name: 'Project',
          },
        ],
      }),
    );
    expect(fileRepository.findOne).toHaveBeenCalledWith({
      where: { id: fileId },
      relations: {
        fileTags: {
          tag: true,
        },
      },
    });
  });

  it('rejects findById when the file is missing or expired', async () => {
    fileRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.findById(fileId)).rejects.toThrow(
      `File with id ${fileId} not found`,
    );

    fileRepository.findOne.mockResolvedValueOnce(
      fileEntity({ expirationDate: new Date('2000-01-01T00:00:00.000Z') }),
    );

    await expect(service.findById(fileId)).rejects.toThrow(
      `File with id ${fileId} has expired`,
    );
  });

  it('downloads an unprotected file', async () => {
    const data = Buffer.from('file contents');

    fileRepository.findOne.mockResolvedValue(fileEntity());
    (readFile as jest.Mock).mockResolvedValue(data);

    await expect(service.downloadFileById(fileId)).resolves.toBe(data);
    expect(readFile).toHaveBeenCalledWith(
      expect.stringContaining('physical-file-name'),
    );
  });

  it('rejects downloads for missing, expired, locked, or empty files', async () => {
    fileRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.downloadFileById(fileId)).rejects.toThrow(
      `File with id ${fileId} not found`,
    );

    fileRepository.findOne.mockResolvedValueOnce(
      fileEntity({ expirationDate: new Date('2000-01-01T00:00:00.000Z') }),
    );

    await expect(service.downloadFileById(fileId)).rejects.toThrow(
      `File with id ${fileId} has expired`,
    );

    fileRepository.findOne.mockResolvedValueOnce(
      fileEntity({ password: 'hashed-password' }),
    );

    await expect(service.downloadFileById(fileId)).rejects.toThrow(
      'Invalid file password',
    );

    fileRepository.findOne.mockResolvedValueOnce(
      fileEntity({ password: 'hashed-password' }),
    );
    authService.comparePassword.mockReturnValue(false);

    await expect(service.downloadFileById(fileId, 'wrong')).rejects.toThrow(
      'Invalid file password',
    );

    fileRepository.findOne.mockResolvedValueOnce(fileEntity());
    (readFile as jest.Mock).mockResolvedValue(Buffer.alloc(0));

    await expect(service.downloadFileById(fileId)).rejects.toThrow(
      `File with id ${fileId} has no raw data to be downloaded`,
    );
  });

  it('downloads a password-protected file when the password matches', async () => {
    const data = Buffer.from('secret contents');

    fileRepository.findOne.mockResolvedValue(
      fileEntity({ password: 'hashed-password' }),
    );
    authService.comparePassword.mockReturnValue(true);
    (readFile as jest.Mock).mockResolvedValue(data);

    await expect(service.downloadFileById(fileId, 'secret')).resolves.toBe(data);
    expect(authService.comparePassword).toHaveBeenCalledWith(
      'secret',
      'hashed-password',
    );
  });

  it('returns all files and files for a user', async () => {
    const file = fileEntity();

    fileRepository.find.mockResolvedValue([file]);
    userService.findByEmail.mockResolvedValue({ files: [file] });

    await expect(service.findAll()).resolves.toHaveLength(1);
    await expect(service.findByUserEmail('user@example.com')).resolves.toHaveLength(
      1,
    );
    expect(userService.findByEmail).toHaveBeenCalledWith('user@example.com');
  });

  it('deletes a file and optionally skips database deletion', async () => {
    const file = fileEntity();

    fileRepository.findOne.mockResolvedValue(file);
    fileRepository.delete.mockResolvedValue({ affected: 1 });

    await expect(service.deleteById(fileId)).resolves.toEqual({
      deleted: true,
    });
    expect(fileRepository.delete).toHaveBeenCalledWith(fileId);
    expect(FileHelper.DeleteFileAtPath).toHaveBeenCalledWith(file.physicalName);

    fileRepository.delete.mockClear();

    await expect(service.deleteById(fileId, false)).resolves.toEqual({
      deleted: true,
    });
    expect(fileRepository.delete).not.toHaveBeenCalled();
  });

  it('rejects delete when the file is missing or database deletion affects no rows', async () => {
    fileRepository.findOne.mockResolvedValueOnce(null);

    await expect(service.deleteById(fileId)).rejects.toThrow(
      `File with id ${fileId} not found`,
    );

    fileRepository.findOne.mockResolvedValueOnce(fileEntity());
    fileRepository.delete.mockResolvedValueOnce({ affected: 0 });

    await expect(service.deleteById(fileId)).rejects.toThrow(
      `File with id ${fileId} not found`,
    );
  });

  it('returns files shared with a user', async () => {
    const files = [fileEntity()];
    const queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(files),
    };

    fileRepository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(service.shareWith('user-id')).resolves.toHaveLength(1);
    expect(fileRepository.createQueryBuilder).toHaveBeenCalledWith('file');
    expect(queryBuilder.innerJoin).toHaveBeenCalledWith(
      'file.fileUsers',
      'fileUser',
    );
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'fileUser.idUser = :userId',
      { userId: 'user-id' },
    );
  });

  it('handles existing and invalid tags during upload creation', async () => {
    tagRepository.findOne.mockResolvedValueOnce({
      id: 'a8408d60-44ac-4948-9bc0-1d62c462ee84',
      name: 'Existing',
    });

    await expect(
      service.create(
        validDto({
          tags: [
            {
              id: 'a8408d60-44ac-4948-9bc0-1d62c462ee84',
              name: '',
            },
          ],
        }),
        fileBuffer,
        userEmail,
      ),
    ).resolves.toBe(true);

    await expect(
      service.create(validDto({ tags: ['   '] }), fileBuffer, userEmail),
    ).rejects.toThrow('Tag at index 0 is empty');

    await expect(
      service.create(validDto({ tags: [{} as never] }), fileBuffer, userEmail),
    ).rejects.toThrow('Tag at index 0 must have an id or name');

    await expect(
      service.create(validDto({ tags: [123 as never] }), fileBuffer, userEmail),
    ).rejects.toThrow('Invalid tag at index 0');

    await expect(
      service.create(
        validDto({
          tags: [
            {
              id: 'a8408d60-44ac-4948-9bc0-1d62c462ee84',
              name: '',
            },
          ],
        }),
        fileBuffer,
        userEmail,
      ),
    ).rejects.toThrow('Each tag must have a valid id or name');
  });

  it('handles empty, plain-string, and duplicate existing tag inputs', async () => {
    await expect(
      service.create(validDto({ tags: undefined }), fileBuffer, userEmail),
    ).resolves.toBe(true);

    await expect(
      service.create(validDto({ tags: '' as never }), fileBuffer, userEmail),
    ).resolves.toBe(true);

    await expect(
      service.create(validDto({ tags: 'Solo' as never }), fileBuffer, userEmail),
    ).resolves.toBe(true);

    tagRepository.findOne.mockResolvedValue({
      id: 'a8408d60-44ac-4948-9bc0-1d62c462ee84',
      name: 'Existing',
    });

    await expect(
      service.create(
        validDto({
          tags: [
            {
              id: 'a8408d60-44ac-4948-9bc0-1d62c462ee84',
              name: '',
            },
            {
              id: '2a165d09-d39c-474b-b5a4-cb6da1f55df5',
              name: '',
            },
          ],
        }),
        fileBuffer,
        userEmail,
      ),
    ).resolves.toBe(true);
  });
});
