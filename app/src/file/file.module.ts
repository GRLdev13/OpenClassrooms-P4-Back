import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from '../../entities/file';
import { FileTag } from '../../entities/file-tag';
import { FileUser } from '../../entities/file-user';
import { Tag } from '../../entities/tag';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { FileController } from './file.controller';
import { FileMapper } from './file.mapper';
import { FileService } from './file.service';
import { FileValidator } from './validators/file.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, FileTag, FileUser, Tag]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [FileController],
  providers: [FileService, FileMapper, FileValidator],
  exports: [FileService, FileMapper],
})
export class FileModule {}
