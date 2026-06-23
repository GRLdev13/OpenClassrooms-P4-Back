import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AUTH_COOKIE_NAME } from '../auth-cookie';
import { AuthService } from '../auth.service';

@Injectable()
export class CookieAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionCookie = request.cookies?.[AUTH_COOKIE_NAME] as
      | string
      | undefined;

    if (!sessionCookie) {
      throw new UnauthorizedException('Authentication cookie is required');
    }

    await this.authService.verifySession(sessionCookie);

    return true;
  }
}
