import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async testDatabaseConnection(): Promise<{
    connected: boolean;
    message: string;
  }> {
    try {
      await this.userRepository.query('SELECT NOW()');
      return {
        connected: true,
        message: 'Successfully connected to the database',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      return {
        connected: false,
        message: `Failed to connect to database: ${message}`,
      };
    }
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.findByEmailOrNull(email);

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async findByEmailOrNull(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: {
        fileUsers: {
          file: {
            fileTags: {
              tag: true,
            },
          },
        },
      },
    });
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new NotFoundException(message);
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async createUser(
    email: string,
    password: string,
    firstname: string,
    lastname: string,
  ): Promise<User> {
    const user = this.userRepository.create({
      email,
      password,
      firstname,
      lastname,
      picture: null,
      hasVerifiedEmail: false,
      fileUsers: [],
    });

    return this.userRepository.save(user);
  }

  async create(): Promise<User[]> {
    return this.userRepository.find();
  }

  async login(): Promise<User[]> {
    return this.userRepository.find();
  }
}
