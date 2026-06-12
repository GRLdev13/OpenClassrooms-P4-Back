import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from '../data-source';

async function bootstrap() {
  // Initialize database connection and create extension BEFORE NestJS app
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('Database connected, enabling uuid-ossp extension...');
    await AppDataSource.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public',
    );
    await AppDataSource.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log('✓ uuid-ossp extension enabled (globally available)');
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
