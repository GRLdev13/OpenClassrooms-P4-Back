import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user';
import { UserDto } from './dtos/user.dto';

@Injectable()
export class UserMapper {
  toDto(user: User): UserDto {
    return new UserDto(user.id, user.email);
  }

  toDtoArray(users: User[]): UserDto[] {
    return users.map((user) => this.toDto(user));
  }
}
