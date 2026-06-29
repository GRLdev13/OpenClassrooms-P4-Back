import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileModule } from './file/file.module';
import { UserModule } from './user/user.module';
import { User } from '../entities/users';
import { Files } from '../entities/files';
import { Tag } from '../entities/tag';
import { FileTag } from '../entities/file-tag';
import { AuthModule } from './auth/auth.module';
import { TagModule } from './tag/tag.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'admin',
      database: process.env.DB_NAME || 'postgres',
      schema: 'public',
      entities: [User, Files, Tag, FileTag],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
    }),
    PrometheusModule.register({
    path: '/metrics', 
  }),
    FileModule,
    UserModule,
    AuthModule,
    TagModule,
  ],
})
export class AppModule {}
