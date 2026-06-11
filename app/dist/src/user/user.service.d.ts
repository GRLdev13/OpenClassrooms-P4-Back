import { UserDto } from './dtos/user.dto';
import { UserMapper } from './user.mapper';
export declare class UserService {
    private userMapper;
    constructor(userMapper: UserMapper);
    testDatabaseConnection(): Promise<{
        connected: boolean;
        message: string;
    }>;
    findByEmail(email: string): Promise<UserDto>;
    findById(id: string): Promise<UserDto>;
    findAll(): Promise<UserDto[]>;
}
