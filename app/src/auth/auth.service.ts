import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectedDto } from '../user/dtos/user.dto';
import { UserMapper } from '../user/user.mapper';
import { UserService } from '../user/user.service';

export const jwtConstants = {
  secret:
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly userMapper: UserMapper,
  ) {}

  async signIn(email: string, password: string): Promise<ConnectedDto> {
    const user = await this.userService.findByEmail(email);

    if (user.password !== password) {
      throw new UnauthorizedException();
    }

    const token = await this.jwtService.signAsync({
      sub: user.email,
      password: user.password,
    });

    return this.userMapper.fromUserToConnected(user, token);
  }

  hashPassword(password: string) {
    return true;
  }

  generateToken(email: string, password: string) {}
}
