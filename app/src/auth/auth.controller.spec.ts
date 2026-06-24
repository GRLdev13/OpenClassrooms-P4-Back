import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AUTH_COOKIE_NAME } from './auth-cookie';
import { AuthController } from './auth.controller';
import { AuthService, AuthenticatedSession } from './auth.service';

describe('AuthController routes', () => {
  let app: INestApplication;
  let authService: {
    signIn: jest.Mock;
    create: jest.Mock;
  };

  const session: AuthenticatedSession = {
    user: {
      id: 'user-id',
      email: 'user@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      files: [],
      picture: '',
    },
    sessionCookie: 'signed-session-token',
  };

  beforeEach(async () => {
    authService = {
      signIn: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /auth/login logs in and sets the authentication cookie', async () => {
    authService.signIn.mockResolvedValue(session);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(authService.signIn).toHaveBeenCalledWith(
      'user@example.com',
      'password123',
    );
    expect(response.body).toEqual(session.user);
    expect(response.headers['set-cookie']?.[0]).toContain(
      `${AUTH_COOKIE_NAME}=${session.sessionCookie}`,
    );
  });

  it('POST /auth/register registers a user and sets the authentication cookie', async () => {
    authService.create.mockResolvedValue(session);

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@example.com',
        password: 'password123',
        passwordConfirmation: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
      })
      .expect(201);

    expect(authService.create).toHaveBeenCalledWith(
      'user@example.com',
      'password123',
      'password123',
      'Jane',
      'Doe',
    );
    expect(response.body).toEqual(session.user);
    expect(response.headers['set-cookie']?.[0]).toContain(
      `${AUTH_COOKIE_NAME}=${session.sessionCookie}`,
    );
  });
});
