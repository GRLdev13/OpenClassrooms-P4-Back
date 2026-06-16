import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from '../../entities/file';
import { AuthModule } from '../auth/auth.module';
import { FileController } from './file.controller';
import { FileMapper } from './file.mapper';
import { FileService } from './file.service';

@Module({
  imports: [TypeOrmModule.forFeature([File]), forwardRef(() => AuthModule)],
  controllers: [FileController],
  providers: [FileService, FileMapper],
  exports: [FileService, FileMapper],
})
export class FileModule {}
