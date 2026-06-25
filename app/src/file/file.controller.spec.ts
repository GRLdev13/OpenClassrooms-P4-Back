import { CanActivate, INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AuthService } from '../auth/auth.service';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import {
  createFileTooLargeException,
  FILE_UPLOAD_FIELD,
  isAllowedFileSize,
  MAX_FILE_SIZE_BYTES,
  ONE_GIB_IN_BYTES,
} from './file.Interceptor';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileValidator } from './validators/file.validator';

describe('FileController routes', () => {
  let app: INestApplication;
  let fileService: {
    create: jest.Mock;
    findAll: jest.Mock;
  };

  async function createTestApp(guard: CanActivate): Promise<INestApplication> {
    fileService = {
      create: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: fileService,
        },
        {
          provide: AuthService,
          useValue: {},
        },
      ],
    })
      .overrideGuard(CookieAuthGuard)
      .useValue(guard)
      .compile();

    const testApp = module.createNestApplication();
    await testApp.init();

    return testApp;
  }

  beforeEach(async () => {
    app = await createTestApp({
      canActivate: jest.fn().mockResolvedValue(true),
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /file/upload uploads a multipart file and returns all files', async () => {
    const uploadedFile = Buffer.from('file contents');
    const files = [
      {
        id: 'file-id',
        name: 'notes.txt',
        uploadDate: null,
        expirationDate: null,
        hasExpired: false,
        tags: [],
        hasPassword: false,
        link: null,
      },
    ];

    fileService.create.mockResolvedValue(true);
    fileService.findAll.mockResolvedValue(files);

    const response = await request(app.getHttpServer())
      .post('/file/upload')
      .field('name', 'notes.txt')
      .field('extension', '.txt')
      .field('email', 'user@example.com')
      .field('expirationTimeInDay', '7')
      .attach('FileIntercepting', uploadedFile, 'notes.txt')
      .expect(201);

    expect(fileService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'notes.txt',
        extension: '.txt',
        email: 'user@example.com',
        expirationTimeInDay: '7',
        rawFile: uploadedFile.toString('base64'),
      }),
    );
    expect(fileService.findAll).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual(files);
  });

  it('POST /file/upload rejects requests without an uploaded file', async () => {
    await request(app.getHttpServer())
      .post('/file/upload')
      .field('name', 'notes.txt')
      .field('extension', '.txt')
      .field('email', 'user@example.com')
      .field('expirationTimeInDay', '7')
      .expect(400);

    expect(fileService.create).not.toHaveBeenCalled();
    expect(fileService.findAll).not.toHaveBeenCalled();
  });

  it('POST /file/upload rejects unauthenticated requests', async () => {
    await app.close();
    app = await createTestApp({
      canActivate: jest
        .fn()
        .mockRejectedValue(
          new UnauthorizedException('Authentication cookie is required'),
        ),
    });

    await request(app.getHttpServer())
      .post('/file/upload')
      .field('name', 'notes.txt')
      .field('extension', '.txt')
      .field('email', 'user@example.com')
      .field('expirationTimeInDay', '7')
      .attach('FileIntercepting', Buffer.from('file contents'), 'notes.txt')
      .expect(401);

    expect(fileService.create).not.toHaveBeenCalled();
  });

  it('POST /file/upload rejects forbidden file extensions', async () => {
    expect(FileValidator.getForbiddenExtension('.exe')).toBe(true);
    expect(FileValidator.getForbiddenExtension('.txt')).toBe(false);

    const response = await request(app.getHttpServer())
      .post('/file/upload')
      .field('name', 'malware.exe')
      .field('extension', '.exe')
      .field('email', 'user@example.com')
      .field('expirationTimeInDay', '7')
      .attach('FileIntercepting', Buffer.from('file contents'), 'notes.txt')
      .expect(400);

    expect(response.body.message).toBe('Invalid file payload');
    expect(response.body.errors).toEqual([
      {
        property: 'extension',
        constraints: {
          forbiddenExtension: '.exe files are not allowed',
        },
      },
    ]);
    expect(fileService.create).not.toHaveBeenCalled();
  });

  it('POST /file/upload rejects forbidden uploaded file names', async () => {
    const response = await request(app.getHttpServer())
      .post('/file/upload')
      .field('name', 'malware')
      .field('extension', '.txt')
      .field('email', 'user@example.com')
      .field('expirationTimeInDay', '7')
      .attach('FileIntercepting', Buffer.from('file contents'), 'malware.exe')
      .expect(400);

    expect(response.body.message).toBe('Invalid file payload');
    expect(response.body.errors).toEqual([
      {
        property: FILE_UPLOAD_FIELD,
        constraints: {
          forbiddenExtension: '.exe files are not allowed',
        },
      },
    ]);
    expect(fileService.create).not.toHaveBeenCalled();
  });

  it('POST /file/upload rejects files that are 1 GiB or larger', () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(ONE_GIB_IN_BYTES - 1);
    expect(isAllowedFileSize(MAX_FILE_SIZE_BYTES)).toBe(true);
    expect(isAllowedFileSize(ONE_GIB_IN_BYTES)).toBe(false);
    expect(createFileTooLargeException().getResponse()).toEqual({
      message: 'Invalid file payload',
      errors: [
        {
          property: FILE_UPLOAD_FIELD,
          constraints: {
            maxFileSize: `File size must be less than ${ONE_GIB_IN_BYTES} bytes`,
          },
        },
      ],
    });
  });

  it('POST /file/upload returns an empty list when creation returns false', async () => {
    fileService.create.mockResolvedValue(false);

    const response = await request(app.getHttpServer())
      .post('/file/upload')
      .field('name', 'notes.txt')
      .field('extension', '.txt')
      .field('email', 'user@example.com')
      .field('expirationTimeInDay', '7')
      .attach('FileIntercepting', Buffer.from('file contents'), 'notes.txt')
      .expect(201);

    expect(fileService.findAll).not.toHaveBeenCalled();
    expect(response.body).toEqual([]);
  });
});
