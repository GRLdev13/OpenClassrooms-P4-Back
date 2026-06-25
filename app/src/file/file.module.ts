import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Files } from '../../entities/files';
import { FileTag } from '../../entities/file-tag';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { FileController } from './file.controller';
import { FileMapper } from './file.mapper';
import { FileService } from './file.service';
import { FileValidator } from './validators/file.validator';

@Module({
  imports: [
    TypeOrmModule.forFeature([Files, FileTag]),
    forwardRef(() => AuthModule),
    forwardRef(() => UserModule),
  ],
  controllers: [FileController],
  providers: [FileService, FileMapper, FileValidator],
  exports: [FileService, FileMapper],
})
export class FileModule {}
