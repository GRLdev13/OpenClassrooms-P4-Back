import { DataSource } from 'typeorm';
import { FileTag } from './entities/file-tag';
import { FileUser } from './entities/file-user';
import { File } from './entities/file';
import { Tag } from './entities/tag';
import { Type } from './entities/type';
import { User } from './entities/user';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'postgres',
  schema: 'public',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [User, File, Tag, Type, FileUser, FileTag],
  migrations: ['data/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  extra: {
    search_path: 'public',
  },
});
