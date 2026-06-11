import { User } from '../../entities/user';
import { UserDto } from './dtos/user.dto';
export declare class UserMapper {
    toDto(user: User): UserDto;
    toDtoArray(users: User[]): UserDto[];
}
