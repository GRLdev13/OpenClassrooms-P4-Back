import {
  CanActivate,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';

describe('TagController routes', () => {
  let app: INestApplication;
  let tagService: {
    add: jest.Mock;
    findAll: jest.Mock;
    delete: jest.Mock;
  };

  async function createTestApp(guard: CanActivate): Promise<INestApplication> {
    tagService = {
      add: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [
        {
          provide: TagService,
          useValue: tagService,
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

  it('POST /tag/add creates a tag', async () => {
    const tag = {
      id: '54b6af70-8af5-4f3d-bd44-e68f66e91cf7',
      name: 'Project',
    };

    tagService.add.mockResolvedValue(tag);

    const response = await request(app.getHttpServer())
      .post('/tag/add')
      .send({ name: 'Project' })
      .expect(201);

    expect(tagService.add).toHaveBeenCalledWith({ name: 'Project' });
    expect(response.body).toEqual(tag);
  });

  it('POST /tag/add rejects invalid tag payloads', async () => {
    await request(app.getHttpServer())
      .post('/tag/add')
      .send({ name: '' })
      .expect(400);

    expect(tagService.add).not.toHaveBeenCalled();
  });

  it('GET /tag/all returns all tags', async () => {
    const tags = [
      {
        id: '54b6af70-8af5-4f3d-bd44-e68f66e91cf7',
        name: 'Project',
      },
      {
        id: 'a8408d60-44ac-4948-9bc0-1d62c462ee84',
        name: 'Urgent',
      },
    ];

    tagService.findAll.mockResolvedValue(tags);

    const response = await request(app.getHttpServer())
      .get('/tag/all')
      .expect(200);

    expect(tagService.findAll).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual(tags);
  });

  it('DELETE /tag/delete deletes a tag by id', async () => {
    const id = '54b6af70-8af5-4f3d-bd44-e68f66e91cf7';

    tagService.delete.mockResolvedValue({ deleted: true });

    const response = await request(app.getHttpServer())
      .delete('/tag/delete')
      .send({ id })
      .expect(200);

    expect(tagService.delete).toHaveBeenCalledWith(id);
    expect(response.body).toEqual({ deleted: true });
  });

  it('DELETE /tag/delete rejects invalid ids', async () => {
    await request(app.getHttpServer())
      .delete('/tag/delete')
      .send({ id: 'not-a-uuid' })
      .expect(400);

    expect(tagService.delete).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated tag requests', async () => {
    await app.close();
    app = await createTestApp({
      canActivate: jest
        .fn()
        .mockRejectedValue(
          new UnauthorizedException('Authentication cookie is required'),
        ),
    });

    await request(app.getHttpServer())
      .get('/tag/all')
      .expect(401);

    expect(tagService.findAll).not.toHaveBeenCalled();
  });
});
