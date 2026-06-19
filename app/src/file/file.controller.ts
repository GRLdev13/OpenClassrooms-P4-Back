import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseFilePipe,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateFileDto } from './dtos/createFile.dto';
import {
  DownloadFileLinkDto,
  DownloadFileRequestDto,
  GetFileDto,
} from './dtos/file.dto';
import { FileService } from './file.service';
import { type Express } from 'express';
import { FileValidator } from './validators/file.validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';

@Controller('file')
@UseGuards(JwtAuthGuard)
export class FileController {
  constructor(
    private readonly fileService: FileService,
    private readonly authService: AuthService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Body(FileValidator) body: CreateFileDto,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ): Promise<GetFileDto[]> {
    console.log('File body parameters: ', body);
    //TODO: Set the "good data" of file name.
    //TODO: check file extensions and everything.
    const createFileDto = {
      ...body,
      rawFile: file.buffer.toString('base64'),
    };

    let isFileCreated = await this.fileService.create(createFileDto);

    if (isFileCreated) {
      return this.fileService.findAll();
    } else {
      return [];
    }
  }

  @Get('by-id')
  async findById(@Query('id') id: string): Promise<GetFileDto> {
    return this.fileService.findById(id);
  }

  @Get('by-user-id')
  async findByUserId(@Query('id') id: string): Promise<GetFileDto[]> {
    return this.fileService.findByUserId(id);
  }

  @Get('all')
  async findAll(): Promise<GetFileDto[]> {
    return this.fileService.findAll();
  }

  @Post('download')
  async downloadById(
    @Body() request: DownloadFileRequestDto,
    // @Headers('authorization') authorization?: string,
  ): Promise<StreamableFile> {
    // const headerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    // const jwtToken = headerToken ?? request.token;
    const dataFile = await this.fileService.downloadFileById(
      request.id,
      request?.password,
      // jwtToken,
    );

    return new StreamableFile(dataFile);
  }

  @Get('link/:link')
  async downloadByLink(
    @Param('link') link: string,
    // @Headers('authorization') authorization?: string,
  ): Promise<GetFileDto> {
    // const headerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    // const jwtToken = headerToken ?? request.token;
    const id = this.authService.revertLink(link);
    return this.fileService.findById(id);

    // const dataFile = await this.fileService.downloadFileById(
    //   fileId,
    //   request?.password,
    //   // jwtToken,
    // );

    // return new StreamableFile(dataFile);
  }

  @Delete('delete/:id')
  async deleteById(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.fileService.deleteById(id);
  }

  //TODO later: share file with another account.
  @Get('share-with')
  async shareWith(@Query('id') id: string): Promise<GetFileDto[]> {
    return this.fileService.findByUserId(id);
  }
}
