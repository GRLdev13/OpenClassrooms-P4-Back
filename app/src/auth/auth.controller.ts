import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ConnectedDto } from '../user/dtos/connected.dto';
import { CreateUserDto } from '../user/dtos/create-user.dto';
import { LoginDto } from '../user/dtos/login.dto';
import { setAuthCookie } from './auth-cookie';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() request: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ConnectedDto> {
    const session = await this.authService.signIn(
      request.email,
      request.password,
    );

    setAuthCookie(response, session.sessionCookie);

    return session.user;
  }

  @Post('register')
  async create(
    @Body() request: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ConnectedDto> {
    const session = await this.authService.create(
      request.email,
      request.password,
      request.passwordConfirmation,
      request.firstName,
      request.lastName,
    );

    setAuthCookie(response, session.sessionCookie);

    return session.user;
  }
}
