import { Injectable } from '@nestjs/common';
import { User } from '../entities/user';
import { exitCode } from 'process';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}