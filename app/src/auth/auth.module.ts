
import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth.service'; 
import { AuthController } from './auth.controller';
import { CookieAuthGuard } from './guards/cookie-auth.guard';
import { AUTH_COOKIE_MAX_AGE_MS } from './auth-cookie';

@Module({
  imports: [
    forwardRef(() => UserModule),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: AUTH_COOKIE_MAX_AGE_MS / 1000 },
    }),
  ],
  providers: [AuthService, CookieAuthGuard],
  controllers: [AuthController],
  exports: [AuthService, CookieAuthGuard],
})
export class AuthModule {}
