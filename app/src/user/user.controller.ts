import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('health')
  async testDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
    return this.userService.testDatabaseConnection();
  }
}
