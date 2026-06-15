import { Controller, Get, Query, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';
import { UserMapper } from './user.mapper';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userMapper: UserMapper,
  ) {}

  @Get('health')
  async testDatabaseConnection(): Promise<{
    connected: boolean;
    message: string;
  }> {
    return this.userService.testDatabaseConnection();
  }

  @Get('by-email')
  async findByEmail(@Query('email') email: string): Promise<UserDto> {
    const user = await this.userService.findByEmail(email);
    return this.userMapper.toDto(user);
  }

  @Get('by-id')
  async findById(@Query('id') id: string): Promise<UserDto> {
    const user = await this.userService.findById(id);
    return this.userMapper.toDto(user);
  }

  @Get('all')
  async findAll(): Promise<UserDto[]> {
    const users = await this.userService.findAll();
    return this.userMapper.toDtoArray(users);
  }

  @Post('login')
  async login(): Promise<UserDto[]> {
    const users = await this.userService.login();
    return this.userMapper.toDtoArray(users);
  }

  @Post('create')
  async create(): Promise<UserDto[]> {
    const users = await this.userService.create();
    return this.userMapper.toDtoArray(users);
  }
}
