import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { ConnectedDto } from '../user/dtos/connected.dto';
import { UserMapper } from '../user/user.mapper';
import { UserService } from '../user/user.service';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production');
}

export const jwtConstants = {
  secret: jwtSecret ?? 'development-only-jwt-secret',
};

@Injectable()
export class AuthService {
  private readonly passwordSaltLength = 16;
  private readonly passwordKeyLength = 64;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly userMapper: UserMapper,
  ) {}

  async signIn(email: string, password: string): Promise<ConnectedDto> {
    const user = await this.userService.findByEmail(email);

    if (!this.comparePassword(password, user.password)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = await this.jwtService.signAsync({
      sub: user.email,
    });

    return this.userMapper.fromUserToConnected(user, token);
  }

  async create(
    email: string,
    password: string,
    passwordConfirmation: string,
    firstName: string,
    lastName: string,
  ): Promise<ConnectedDto> {
    if (password !== passwordConfirmation) {
      throw new BadRequestException(
        'Password and password confirmation do not match',
      );
    }

    const existingUser = await this.userService.findByEmailOrNull(email);

    if (existingUser) {
      throw new ConflictException('Email already used');
    }

    if (password.length < 8) {
      throw new BadRequestException('Password must contain at least 8 characters');
    }

    const hashedPassword = this.hashPassword(password);
    const user = await this.userService.createUser(email, hashedPassword, firstName, lastName);
    const token = await this.jwtService.signAsync({
      sub: user.email,
    });

    return this.userMapper.fromUserToConnected(user, token);
  }

  hashPassword(password: string): string {
    const salt = randomBytes(this.passwordSaltLength).toString('hex');
    const hash = scryptSync(password, salt, this.passwordKeyLength).toString('hex');

    return `${salt}:${hash}`;
  }

  async verifyToken(token?: string): Promise<void> {
    if (!token) {
      throw new UnauthorizedException('JWT token is required');
    }

    try {
      await this.jwtService.verifyAsync(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired JWT token');
    }
  }

  comparePassword(password: string, hashedPassword: string): boolean {
    const [salt, storedHash] = hashedPassword.split(':');

    if (!salt || !storedHash) {
      return false;
    }

    const hashedBuffer = Buffer.from(storedHash, 'hex');
    const passwordBuffer = scryptSync(password, salt, hashedBuffer.length);

    return (
      hashedBuffer.length === passwordBuffer.length &&
      timingSafeEqual(hashedBuffer, passwordBuffer)
    );
  }

  generateLink(id: string): string {
    return Buffer.from(id, 'utf8').toString('base64url');
  }

  revertLink(encodedId: string): string {
    const normalizedLink = encodedId?.trim().replace(/=+$/, '');

    if (!normalizedLink) {
      throw new BadRequestException('File link is required');
    }

    const idBuffer = Buffer.from(normalizedLink, 'base64url');
    const id = idBuffer.toString('utf8');

    if (
      idBuffer.toString('base64url') !== normalizedLink ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    ) {
      throw new BadRequestException('Invalid file link');
    }

    return id;
  }
}
