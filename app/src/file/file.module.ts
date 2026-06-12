import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from '../../entities/file';
import { FileController } from './file.controller';
import { FileMapper } from './file.mapper';
import { FileService } from './file.service';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FileController],
  providers: [FileService, FileMapper],
  exports: [FileService],
})
export class FileModule {}
