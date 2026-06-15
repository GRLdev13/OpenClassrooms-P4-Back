import { Controller, Post } from '@nestjs/common';
import { UserDto } from '../user/dtos/user.dto';
import { UserMapper } from '../user/user.mapper';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {
      constructor(
        private readonly userService: UserService,
        private readonly userMapper: UserMapper,
      ) {}

 @Post('login')
  async login(): Promise<UserDto[]> {
    const users = await this.userService.login();
    return this.userMapper.toDtoArray(users);
  }

}
