import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { CookieAuthGuard } from '../auth/guards/cookie-auth.guard';
import { AddTagDto } from './dtos/addTag.dto';
import { DeleteTagDto } from './dtos/deleteTag.dto';
import { GetTagDto } from './dtos/getTag.dto';
import { TagService } from './tag.service';

@Controller('tag')
@UseGuards(CookieAuthGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post('add')
  async add(@Body() request: AddTagDto): Promise<GetTagDto> {
    return this.tagService.add(request);
  }

  @Get('all')
  async findAll(): Promise<GetTagDto[]> {
    return this.tagService.findAll();
  }

  @Delete('delete')
  async delete(@Body() request: DeleteTagDto): Promise<{ deleted: boolean }> {
    return this.tagService.delete(request.id);
  }
}
