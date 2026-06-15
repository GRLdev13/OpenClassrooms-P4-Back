import { Injectable, UnauthorizedException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientEncryption } from 'typeorm/driver/mongodb/typings.js';
import { JwtService } from '@nestjs/jwt';
import { UserService
 } from '../user/user.service';

export const jwtConstants = {
  secret: 'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
};

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthService)
    private userRepository: UserService,
     private jwtService: JwtService
  ) {}


  async signIn(username: string, pass: string): Promise<any> {
    const user = await this.userRepository.findByEmail(username);
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const { password, ...result } = user;
    // TODO: Generate a JWT and return it here
    // instead of the user object
    const payload = { sub: user.email, password: user.password };
    return {
      // 💡 Here the JWT secret key that's used for signing the payload 
      // is the key that was passed in the JwtModule
      access_token: await this.jwtService.signAsync(payload),
    };
  }


  hashPassword(password: string) {
    return true;
  }

  generateToken(email:string, password:string)
  {

  }
}
