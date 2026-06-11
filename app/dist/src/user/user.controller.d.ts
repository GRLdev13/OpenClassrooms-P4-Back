import { UserService } from './user.service';
import { UserDto } from './dtos/user.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    testDatabaseConnection(): Promise<{
        connected: boolean;
        message: string;
    }>;
    findByEmail(email: string): Promise<UserDto>;
    findById(id: string): Promise<UserDto>;
    findAll(): Promise<UserDto[]>;
}
