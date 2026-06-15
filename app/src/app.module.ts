import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileModule } from './file/file.module';
import { UserModule } from './user/user.module';
import { User } from '../entities/user';
import { File } from '../entities/file';
import { Tag } from '../entities/tag';
import { Type } from '../entities/type';
import { FileUser } from '../entities/file-user';
import { FileTag } from '../entities/file-tag';
import { FileType } from '../entities/file-type';
import { MigrationRunner } from './database/migration.runner';
import { AuthModule } from './auth/auth.module';

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
      entities: [User, File, Tag, Type, FileUser, FileTag, FileType],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
    }),
    FileModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, MigrationRunner],
})
export class AppModule {}
