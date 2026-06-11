import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../../data-source';

@Injectable()
export class UserService {
  async testDatabaseConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.release();
      
      return {
        connected: true,
        message: 'Successfully connected to the database',
      };
    } catch (error) {
      return {
        connected: false,
        message: `Failed to connect to database: ${error.message}`,
      };
    }
  }
}
