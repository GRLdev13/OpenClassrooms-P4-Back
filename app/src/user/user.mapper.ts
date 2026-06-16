import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user';
import { ConnectedDto, UserDto } from './dtos/user.dto';
import { FileMapper } from '../file/file.mapper';

@Injectable()
export class UserMapper {
  constructor(
    private readonly fileMapper: FileMapper,
  ) {}

  toDto(user: User): UserDto {
    return new UserDto(user.id, user.email);
  }

  toDtoArray(users: User[]): UserDto[] {
    return users.map((user) => this.toDto(user));
  }

  fromUserToConnected(user: User, token = ''): ConnectedDto {
    return new ConnectedDto(
      user.id,
      user.email,
      user.firstname,
      user.lastname,
      token,
      this.fileMapper.toDtoArray(
        (user.fileUsers ?? [])
          .map((fileUser) => fileUser.file)
          .filter((file) => !!file),
      ),
      this.fileMapper.fromBlob(user.picture)
    );
  }
}
