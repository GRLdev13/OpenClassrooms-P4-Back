import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MigrationRunner implements OnModuleInit {
  private readonly logger = new Logger(MigrationRunner.name);

  constructor(private dataSource: DataSource) {}

  async onModuleInit() {
    await this.runMigrations();
  }

  private async runMigrations(): Promise<void> {
    try {
      this.logger.log('Starting database migrations...');

      const migrationsDir = path.join(__dirname, '../../data/migrations');

      if (!fs.existsSync(migrationsDir)) {
        this.logger.warn(`Migrations directory not found at ${migrationsDir}`);
        return;
      }

      const migrationFiles = fs
        .readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      if (migrationFiles.length === 0) {
        this.logger.log('No migration files found.');
        return;
      }

      for (const file of migrationFiles) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        try {
          this.logger.log(`Executing migration: ${file}`);
          await this.dataSource.query(sql);
          this.logger.log(`✓ Migration completed: ${file}`);
        } catch (error) {
          // Check if it's a "already exists" error (table already created)
          if (
            error.message.includes('already exists') ||
            error.message.includes('duplicate key')
          ) {
            this.logger.log(`✓ Migration skipped (already applied): ${file}`);
          } else {
            this.logger.error(`✗ Migration failed: ${file}`, error.message);
            throw error;
          }
        }
      }

      this.logger.log('✓ All migrations completed successfully');
    } catch (error) {
      this.logger.error('Migration process failed', error);
      throw error;
    }
  }
}
