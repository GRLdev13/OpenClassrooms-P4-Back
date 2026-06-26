import { NotFoundException } from '@nestjs/common';
import { User } from '../../entities/users';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: {
    query: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };

  const user = {
    id: '54b6af70-8af5-4f3d-bd44-e68f66e91cf7',
    email: 'user@example.com',
    password: 'hashed-password',
    firstname: 'Jane',
    lastname: 'Doe',
    hasVerifiedEmail: false,
    files: [],
  } as User;

  beforeEach(() => {
    userRepository = {
      query: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => ({ id: user.id, ...data })),
    };

    service = new UserService(userRepository as never);
  });

  it('reports a successful database connection', async () => {
    userRepository.query.mockResolvedValue([{ now: new Date() }]);

    await expect(service.testDatabaseConnection()).resolves.toEqual({
      connected: true,
      message: 'Successfully connected to the database',
    });
    expect(userRepository.query).toHaveBeenCalledWith('SELECT NOW()');
  });

  it('reports database connection failures without throwing', async () => {
    userRepository.query.mockRejectedValue(new Error('connection refused'));

    await expect(service.testDatabaseConnection()).resolves.toEqual({
      connected: false,
      message: 'Failed to connect to database: connection refused',
    });
  });

  it('finds a user by email', async () => {
    userRepository.findOne.mockResolvedValue(user);

    await expect(service.findByEmail('user@example.com')).resolves.toBe(user);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      relations: {
        files: {
          fileTags: {
            tag: true,
          },
        },
      },
    });
  });

  it('returns null when no user exists for an email', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.findByEmailOrNull('missing@example.com')).resolves.toBe(
      null,
    );
  });

  it('throws when finding a missing user by email', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.findByEmail('missing@example.com')).rejects.toThrow(
      new NotFoundException('User with email missing@example.com not found'),
    );
  });

  it('finds a user by id', async () => {
    userRepository.findOne.mockResolvedValue(user);

    await expect(service.findById(user.id)).resolves.toBe(user);
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: user.id },
    });
  });

  it('throws when finding a missing user by id', async () => {
    userRepository.findOne.mockResolvedValue(null);

    await expect(service.findById(user.id)).rejects.toThrow(
      new NotFoundException(`User with id ${user.id} not found`),
    );
  });

  it('wraps repository errors from findById as not found exceptions', async () => {
    userRepository.findOne.mockRejectedValue(new Error('database unavailable'));

    await expect(service.findById(user.id)).rejects.toThrow(
      new NotFoundException('database unavailable'),
    );
  });

  it('returns all users', async () => {
    userRepository.find.mockResolvedValue([user]);

    await expect(service.findAll()).resolves.toEqual([user]);
    expect(userRepository.find).toHaveBeenCalledTimes(1);
  });

  it('creates a user with an unverified email flag', async () => {
    await expect(
      service.createUser('user@example.com', 'hashed-password', 'Jane', 'Doe'),
    ).resolves.toEqual({
      id: user.id,
      email: 'user@example.com',
      password: 'hashed-password',
      firstname: 'Jane',
      lastname: 'Doe',
      hasVerifiedEmail: false,
    });

    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'hashed-password',
      firstname: 'Jane',
      lastname: 'Doe',
      hasVerifiedEmail: false,
    });
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com',
        hasVerifiedEmail: false,
      }),
    );
  });

  it('keeps legacy create and login methods returning all users', async () => {
    userRepository.find.mockResolvedValue([user]);

    await expect(service.create()).resolves.toEqual([user]);
    await expect(service.login()).resolves.toEqual([user]);
    expect(userRepository.find).toHaveBeenCalledTimes(2);
  });
});
