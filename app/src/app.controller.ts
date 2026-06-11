import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { User } from '../entities/user';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('user')
  getTest(@Query('user') id: string): User {
    return this.appService.getTest(id);
  }
}
