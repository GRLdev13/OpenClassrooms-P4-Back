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
  const allowedOrigins = (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isAllowedOrigin = allowedOrigins.includes(origin);
      const isLocalDevelopmentOrigin =
        allowedOrigins.length === 0 &&
        /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

      if (isAllowedOrigin || isLocalDevelopmentOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
