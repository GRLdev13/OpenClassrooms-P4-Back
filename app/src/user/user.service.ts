import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user';
import { UserDto } from './dtos/user.dto';
import { UserMapper } from './user.mapper';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private userMapper: UserMapper,
  ) {}

  async testDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      await this.userRepository.query('SELECT NOW()');
      return {
        connected: true,
        message: 'Successfully connected to the database',
      };
    } catch (error) {
      return {
        connected: false,
        message: `Failed to connect to database: ${error.message}`,
      };
    }
  }

  async findByEmail(email: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return this.userMapper.toDto(user);
  }

  async findById(id: string): Promise<UserDto> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return this.userMapper.toDto(user);
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.userRepository.find();
    return this.userMapper.toDtoArray(users);
  }
}
