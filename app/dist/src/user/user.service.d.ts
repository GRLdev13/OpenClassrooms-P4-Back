import { Repository } from 'typeorm';
import { User } from '../../entities/user';
import { UserDto } from './dtos/user.dto';
import { UserMapper } from './user.mapper';
export declare class UserService {
    private userRepository;
    private userMapper;
    constructor(userRepository: Repository<User>, userMapper: UserMapper);
    testDatabaseConnection(): Promise<{
        connected: boolean;
        message: string;
    }>;
    findByEmail(email: string): Promise<UserDto>;
    findById(id: string): Promise<UserDto>;
    findAll(): Promise<UserDto[]>;
}
