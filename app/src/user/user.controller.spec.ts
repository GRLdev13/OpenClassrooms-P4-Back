import {
  CanActivate,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AUTH_COOKIE_NAME } from '../auth/auth-cookie';
import { AuthService, AuthenticatedSession } from '../auth/auth.service';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import { UserMapper } from './user.mapper';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController routes', () => {
  let app: INestApplication;
  let userService: {
    testDatabaseConnection: jest.Mock;
    findByEmail: jest.Mock;
    findById: jest.Mock;
    findAll: jest.Mock;
  };
  let userMapper: {
    toDto: jest.Mock;
    toDtoArray: jest.Mock;
  };
  let authService: {
    signIn: jest.Mock;
  };

  const user = {
    id: '54b6af70-8af5-4f3d-bd44-e68f66e91cf7',
    email: 'user@example.com',
    firstname: 'Jane',
    lastname: 'Doe',
    files: [],
  };

  const userDto = {
    id: user.id,
    email: user.email,
  };

  const session: AuthenticatedSession = {
    user: {
      id: user.id,
      email: user.email,
      firstName: 'Jane',
      lastName: 'Doe',
      files: [],
      picture: '',
    },
    sessionCookie: 'signed-session-token',
  };

  async function createTestApp(guard: CanActivate): Promise<INestApplication> {
    userService = {
      testDatabaseConnection: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };

    userMapper = {
      toDto: jest.fn(),
      toDtoArray: jest.fn(),
    };

    authService = {
      signIn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: UserMapper,
          useValue: userMapper,
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

  it('GET /user/health returns database health', async () => {
    const health = {
      connected: true,
      message: 'Successfully connected to the database',
    };

    userService.testDatabaseConnection.mockResolvedValue(health);

    const response = await request(app.getHttpServer())
      .get('/user/health')
      .expect(200);

    expect(userService.testDatabaseConnection).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual(health);
  });

  it('GET /user/by-email finds and maps a user by email', async () => {
    userService.findByEmail.mockResolvedValue(user);
    userMapper.toDto.mockReturnValue(userDto);

    const response = await request(app.getHttpServer())
      .get('/user/by-email')
      .query({ email: user.email })
      .expect(200);

    expect(userService.findByEmail).toHaveBeenCalledWith(user.email);
    expect(userMapper.toDto).toHaveBeenCalledWith(user);
    expect(response.body).toEqual(userDto);
  });

  it('GET /user/by-id finds and maps a user by id', async () => {
    userService.findById.mockResolvedValue(user);
    userMapper.toDto.mockReturnValue(userDto);

    const response = await request(app.getHttpServer())
      .get('/user/by-id')
      .query({ id: user.id })
      .expect(200);

    expect(userService.findById).toHaveBeenCalledWith(user.id);
    expect(userMapper.toDto).toHaveBeenCalledWith(user);
    expect(response.body).toEqual(userDto);
  });

  it('GET /user/all returns all mapped users', async () => {
    userService.findAll.mockResolvedValue([user]);
    userMapper.toDtoArray.mockReturnValue([userDto]);

    const response = await request(app.getHttpServer())
      .get('/user/all')
      .expect(200);

    expect(userService.findAll).toHaveBeenCalledTimes(1);
    expect(userMapper.toDtoArray).toHaveBeenCalledWith([user]);
    expect(response.body).toEqual([userDto]);
  });

  it('POST /user/login logs in and sets the authentication cookie', async () => {
    authService.signIn.mockResolvedValue(session);

    const response = await request(app.getHttpServer())
      .post('/user/login')
      .send({
        email: user.email,
        password: 'password123',
      })
      .expect(201);

    expect(authService.signIn).toHaveBeenCalledWith(user.email, 'password123');
    expect(response.body).toEqual(session.user);
    expect(response.headers['set-cookie']?.[0]).toContain(
      `${AUTH_COOKIE_NAME}=${session.sessionCookie}`,
    );
  });

  it('POST /user/login rejects invalid login payloads', async () => {
    await request(app.getHttpServer())
      .post('/user/login')
      .send({
        email: 'not-an-email',
        password: '',
      })
      .expect(400);

    expect(authService.signIn).not.toHaveBeenCalled();
  });

  it('rejects unauthenticated protected user requests', async () => {
    await app.close();
    app = await createTestApp({
      canActivate: jest
        .fn()
        .mockRejectedValue(
          new UnauthorizedException('Authentication cookie is required'),
        ),
    });

    await request(app.getHttpServer())
      .get('/user/all')
      .expect(401);

    expect(userService.findAll).not.toHaveBeenCalled();
  });
});
