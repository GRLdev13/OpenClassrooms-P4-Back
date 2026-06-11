import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    testDatabaseConnection(): Promise<{
        connected: boolean;
        message: string;
    }>;
}
