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
    findByUserEmail: jest.Mock;
    downloadFileById: jest.Mock;
    findById: jest.Mock;
    deleteById: jest.Mock;
  };
  let authService: {
    revertLink: jest.Mock;
    getSecuredEmail: jest.Mock;
  };

  const fileId = '54b6af70-8af5-4f3d-bd44-e68f66e91cf7';
  const fileDto = {
    id: fileId,
    name: 'notes.txt',
    uploadDate: null,
    expirationDate: null,
    hasExpired: false,
    tags: [],
    hasPassword: false,
    link: null,
  };

  async function createTestApp(guard: CanActivate): Promise<INestApplication> {
    fileService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByUserEmail: jest.fn(),
      downloadFileById: jest.fn(),
      findById: jest.fn(),
      deleteById: jest.fn(),
    };

    authService = {
      revertLink: jest.fn(),
      getSecuredEmail: jest.fn().mockResolvedValue('user@example.com'),
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
          useValue: authService,
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
      .field('expirationTimeInDay', '7')
      .attach(FILE_UPLOAD_FIELD, uploadedFile, 'notes.txt')
      .expect(201);

    expect(fileService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'notes.txt',
        extension: '.txt',
        expirationTimeInDay: '7',
      }),
      uploadedFile,
      'user@example.com',
    );
    expect(fileService.findAll).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual(files);
  });

  it('POST /file/upload rejects requests without an uploaded file', async () => {
    await request(app.getHttpServer())
      .post('/file/upload')
      .field('name', 'notes.txt')
      .field('extension', '.txt')
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
      .field('expirationTimeInDay', '7')
      .attach(FILE_UPLOAD_FIELD, Buffer.from('file contents'), 'notes.txt')
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
      .field('expirationTimeInDay', '7')
      .attach(FILE_UPLOAD_FIELD, Buffer.from('file contents'), 'notes.txt')
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
      .field('expirationTimeInDay', '7')
      .attach(FILE_UPLOAD_FIELD, Buffer.from('file contents'), 'malware.exe')
      .expect(400);

    expect(response.body.message).toBe('.exe files are not allowed');
    expect(fileService.create).not.toHaveBeenCalled();
  });

  it('POST /file/upload rejects files that are 1 GiB or larger', () => {
    expect(MAX_FILE_SIZE_BYTES).toBe(ONE_GIB_IN_BYTES - 1);
    expect(isAllowedFileSize(MAX_FILE_SIZE_BYTES)).toBe(true);
    expect(isAllowedFileSize(ONE_GIB_IN_BYTES)).toBe(false);
    expect(createFileTooLargeException().getResponse()).toEqual({
      message: `File size must be less than ${ONE_GIB_IN_BYTES} bytes`,
    });
  });

  it('POST /file/upload returns an empty list when creation returns false', async () => {
    fileService.create.mockResolvedValue(false);

    const response = await request(app.getHttpServer())
      .post('/file/upload')
      .field('name', 'notes.txt')
      .field('extension', '.txt')
      .field('expirationTimeInDay', '7')
      .attach(FILE_UPLOAD_FIELD, Buffer.from('file contents'), 'notes.txt')
      .expect(201);

    expect(fileService.findAll).not.toHaveBeenCalled();
    expect(response.body).toEqual([]);
  });

  it('GET /file/files returns files for the secured user email', async () => {
    authService.getSecuredEmail.mockResolvedValue('secured@example.com');
    fileService.findByUserEmail.mockResolvedValue([fileDto]);

    const response = await request(app.getHttpServer())
      .get('/file/files')
      .expect(200);

    expect(authService.getSecuredEmail).toHaveBeenCalledTimes(1);
    expect(fileService.findByUserEmail).toHaveBeenCalledWith(
      'secured@example.com',
    );
    expect(response.body).toEqual([fileDto]);
  });

  it('GET /file/files rejects invalid secured cookies', async () => {
    authService.getSecuredEmail.mockRejectedValue(
      new UnauthorizedException('Authentication cookie is invalid or expired'),
    );

    await request(app.getHttpServer())
      .get('/file/files')
      .expect(401);

    expect(fileService.findByUserEmail).not.toHaveBeenCalled();
  });

  it('POST /file/download streams an authenticated file download', async () => {
    const data = Buffer.from('file contents');

    fileService.downloadFileById.mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .post('/file/download')
      .send({ id: fileId, password: 'secret' })
      .expect(201);

    expect(fileService.downloadFileById).toHaveBeenCalledWith(fileId, 'secret');
    expect(response.body).toEqual(data);
  });

  it('POST /file/download rejects invalid download payloads', async () => {
    await request(app.getHttpServer())
      .post('/file/download')
      .send({ id: 'not-a-uuid' })
      .expect(400);

    expect(fileService.downloadFileById).not.toHaveBeenCalled();
  });

  it('POST /file/download/anonymous streams an anonymous file download', async () => {
    const data = Buffer.from('anonymous contents');

    fileService.downloadFileById.mockResolvedValue(data);

    const response = await request(app.getHttpServer())
      .post('/file/download/anonymous')
      .send({ id: fileId })
      .expect(201);

    expect(fileService.downloadFileById).toHaveBeenCalledWith(
      fileId,
      undefined,
    );
    expect(response.body).toEqual(data);
  });

  it('GET /file/link/:link resolves a link and returns the file', async () => {
    authService.revertLink.mockReturnValue(fileId);
    fileService.findById.mockResolvedValue(fileDto);

    const response = await request(app.getHttpServer())
      .get('/file/link/signed-link')
      .expect(200);

    expect(authService.revertLink).toHaveBeenCalledWith('signed-link');
    expect(fileService.findById).toHaveBeenCalledWith(fileId);
    expect(response.body).toEqual(fileDto);
  });

  it('DELETE /file/delete/:id deletes a file', async () => {
    fileService.deleteById.mockResolvedValue({ deleted: true });

    const response = await request(app.getHttpServer())
      .delete(`/file/delete/${fileId}`)
      .expect(200);

    expect(fileService.deleteById).toHaveBeenCalledWith(fileId);
    expect(response.body).toEqual({ deleted: true });
  });
});
