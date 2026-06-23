import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { setAuthCookie } from '../auth/auth-cookie';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
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
  @UseGuards(CookieAuthGuard)
  async testDatabaseConnection(): Promise<{
    connected: boolean;
    message: string;
  }> {
    return this.userService.testDatabaseConnection();
  }

  @Get('by-email')
  @UseGuards(CookieAuthGuard)
  async findByEmail(@Query('email') email: string): Promise<UserDto> {
    const user = await this.userService.findByEmail(email);
    return this.userMapper.toDto(user);
  }

  @Get('by-id')
  @UseGuards(CookieAuthGuard)
  async findById(@Query('id') id: string): Promise<UserDto> {
    const user = await this.userService.findById(id);
    return this.userMapper.toDto(user);
  }

  @Get('all')
  @UseGuards(CookieAuthGuard)
  async findAll(): Promise<UserDto[]> {
    const users = await this.userService.findAll();
    return this.userMapper.toDtoArray(users);
  }

  @Post('login')
  async login(
    @Body() connectRequest: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ConnectedDto> {
    const session = await this.authService.signIn(
      connectRequest.email,
      connectRequest.password,
    );

    setAuthCookie(response, session.sessionCookie);

    return session.user;
  }
}
