import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('health')
  async testDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
    return this.userService.testDatabaseConnection();
  }

  @Get('by-email')
  async findByEmail(@Query('email') email: string): Promise<UserDto> {
    return this.userService.findByEmail(email);
  }

  @Get('by-id')
  async findById(@Query('id') id: string): Promise<UserDto> {
    return this.userService.findById(id);
  }

  @Get('all')
  async findAll(): Promise<UserDto[]> {
    return this.userService.findAll();
  }
}
