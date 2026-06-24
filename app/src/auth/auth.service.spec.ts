import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserMapper } from '../user/user.mapper';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: {
    findByEmailOrNull: jest.Mock;
  };

  beforeEach(async () => {
    userService = {
      findByEmailOrNull: jest.fn(),
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
          useValue: {},
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
