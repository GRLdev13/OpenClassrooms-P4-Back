import { Body, Controller, Post } from '@nestjs/common';
import { ConnectedDto, CreateUserDto, LoginDto } from '../user/dtos/user.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() request: LoginDto): Promise<ConnectedDto> {
    return this.authService.signIn(request.email, request.password);
  }

  @Post('create')
  async create(@Body() request: CreateUserDto): Promise<ConnectedDto> {
    return this.authService.create(request.email, request.password, request.firstname, request.lastname);
  }

}
