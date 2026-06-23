import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user';
import { FileMapper } from '../file/file.mapper';
import { ConnectedDto } from './dtos/connected.dto';
import { UserDto } from './dtos/user.dto';

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

  fromUserToConnected(user: User): ConnectedDto {
    return new ConnectedDto(
      user.id,
      user.email,
      user.firstname,
      user.lastname,
      this.fileMapper.toDtoArray(
        (user.fileUsers ?? [])
          .map((fileUser) => fileUser.file)
          .filter((file) => !!file),
      ),
      this.fileMapper.fromBlob(user.picture)
    );
  }
}
