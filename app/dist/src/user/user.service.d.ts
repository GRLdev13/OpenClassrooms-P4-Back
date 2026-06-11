export declare class UserService {
    testDatabaseConnection(): Promise<{
        connected: boolean;
        message: string;
    }>;
}
