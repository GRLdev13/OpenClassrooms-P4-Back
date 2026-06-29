import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserMapper } from '../user/user.mapper';
import { UserService } from '../user/user.service';
import { AUTH_COOKIE_NAME } from './auth-cookie';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: {
    findByEmailOrNull: jest.Mock;
  };
  let jwtService: {
    verifyAsync: jest.Mock;
  };

  beforeEach(async () => {
    userService = {
      findByEmailOrNull: jest.fn(),
    };
    jwtService = {
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: UserMapper,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash and verify passwords', () => {
    const hashedPassword = service.hashPassword('password123');

    expect(hashedPassword).not.toBe('password123');
    expect(service.comparePassword('password123', hashedPassword)).toBe(true);
    expect(service.comparePassword('wrong-password', hashedPassword)).toBe(false);
  });

  it('should generate and revert a Base64 URL file link', () => {
    const id = '123e4567-e89b-42d3-a456-426614174000';
    const link = service.generateLink(id);

    expect(link).toBe('MTIzZTQ1NjctZTg5Yi00MmQzLWE0NTYtNDI2NjE0MTc0MDAw');
    expect(service.revertLink(link)).toBe(id);
  });

  it('should reject an invalid file link', () => {
    expect(() => service.revertLink('not-a-file-link')).toThrow(
      BadRequestException,
    );
  });

  it('should extract the user email from a secured cookie', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'user@example.com' });

    await expect(
      service.getSecuredEmail(
        createRequestWithCookie('signed-session-cookie'),
      ),
    ).resolves.toBe('user@example.com');

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(
      'signed-session-cookie',
    );
  });

  it('should reject missing secured cookies', async () => {
    await expect(
      service.getSecuredEmail(createRequestWithCookie(undefined)),
    ).rejects.toThrow('Authentication cookie is required');

    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('should reject invalid secured cookies', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    await expect(
      service.getSecuredEmail(
        createRequestWithCookie('invalid-session-cookie'),
      ),
    ).rejects.toThrow('Authentication cookie is invalid or expired');
  });

  it('should reject secured cookies without an email subject', async () => {
    jwtService.verifyAsync.mockResolvedValue({});

    await expect(
      service.getSecuredEmail(
        createRequestWithCookie('signed-session-cookie'),
      ),
    ).rejects.toThrow('Authentication cookie is invalid or expired');
  });

  it('should reject registration when password confirmation differs', async () => {
    await expect(
      service.create(
        'user@example.com',
        'password123',
        'different-password',
        'Jane',
        'Doe',
      ),
    ).rejects.toThrow('Password and password confirmation do not match');

    expect(userService.findByEmailOrNull).not.toHaveBeenCalled();
  });

  it('should reject registration when the email already exists', async () => {
    userService.findByEmailOrNull.mockResolvedValue({
      email: 'user@example.com',
    });

    await expect(
      service.create(
        'user@example.com',
        'password123',
        'password123',
        'Jane',
        'Doe',
      ),
    ).rejects.toThrow('Email already used');
  });
});

function createRequestWithCookie(sessionCookie?: string) {
  return {
    cookies:
      sessionCookie === undefined
        ? {}
        : { [AUTH_COOKIE_NAME]: sessionCookie },
  } as any;
}
