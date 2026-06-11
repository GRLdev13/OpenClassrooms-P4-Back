import { OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
export declare class MigrationRunner implements OnModuleInit {
    private dataSource;
    private readonly logger;
    constructor(dataSource: DataSource);
    onModuleInit(): Promise<void>;
    private runMigrations;
}
