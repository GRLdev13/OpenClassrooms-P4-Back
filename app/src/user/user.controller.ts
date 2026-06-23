import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { setAuthCookie } from '../auth/auth-cookie';
import { AuthService } from '../auth/auth.service';
import { ConnectedDto } from './dtos/connected.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { UserDto } from './dtos/user.dto';
import { UserMapper } from './user.mapper';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userMapper: UserMapper,
    private readonly authService: AuthService,
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
  async login(
    @Body() connectRequest: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<Omit<ConnectedDto, 'token'>> {
    const connectedUser = await this.authService.signIn(
      connectRequest.email,
      connectRequest.password,
    );
    const { token, ...user } = connectedUser;

    setAuthCookie(response, token);

    return user;
  }
}
