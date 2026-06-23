import { Controller, Get, UseGuards } from '@nestjs/common';
import { CookieAuthGuard } from './auth/guards/cookie-auth.guard';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @UseGuards(CookieAuthGuard)
  getHello(): string {
    return this.appService.getHello();
  }
}
