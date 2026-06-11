import { Injectable, NotFoundException } from '@nestjs/common';
import { AppDataSource } from '../../data-source';
import { User } from '../../entities/user';
import { UserDto } from './dtos/user.dto';
import { UserMapper } from './user.mapper';

@Injectable()
export class UserService {
  constructor(private userMapper: UserMapper) {}

  async testDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.release();
      
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
    const user = await User.findByName(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return this.userMapper.toDto(user);
  }

  async findById(id: string): Promise<UserDto> {
    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.userMapper.toDto(user);
  }

  async findAll(): Promise<UserDto[]> {
    const users = await User.find();
    return this.userMapper.toDtoArray(users);
  }
}
