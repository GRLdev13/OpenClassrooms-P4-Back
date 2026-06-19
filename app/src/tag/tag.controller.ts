import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AddTagDto } from './dtos/addTagDto';
import { DeleteTagDto } from './dtos/deleteTagDto';
import { TagDto } from './dtos/tagDto';
import { TagService } from './tag.service';

@Controller('tag')
@UseGuards(JwtAuthGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post('add')
  async add(@Body() request: AddTagDto): Promise<TagDto> {
    return this.tagService.add(request);
  }

  @Delete('delete')
  async delete(@Body() request: DeleteTagDto): Promise<{ deleted: boolean }> {
    return this.tagService.delete(request.id);
  }
}
