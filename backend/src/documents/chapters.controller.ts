import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto, UpdateChapterDto, ChapterResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('books/:bookId/chapters')
@UseGuards(JwtAuthGuard)
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('bookId') bookId: string,
    @CurrentUser() user: User,
    @Body() createChapterDto: CreateChapterDto,
  ): Promise<ChapterResponseDto> {
    return this.chaptersService.create(bookId, user.id, createChapterDto);
  }

  @Get()
  async findAllByBook(
    @Param('bookId') bookId: string,
    @CurrentUser() user: User,
  ): Promise<ChapterResponseDto[]> {
    return this.chaptersService.findAllByBook(bookId, user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<ChapterResponseDto> {
    return this.chaptersService.findOne(id, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() updateChapterDto: UpdateChapterDto,
  ): Promise<ChapterResponseDto> {
    return this.chaptersService.update(id, user.id, updateChapterDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.chaptersService.remove(id, user.id);
  }

  @Put('reorder')
  async reorderChapters(
    @Param('bookId') bookId: string,
    @CurrentUser() user: User,
    @Body() body: { chapterIds: string[] },
  ): Promise<ChapterResponseDto[]> {
    return this.chaptersService.reorderChapters(bookId, user.id, body.chapterIds);
  }
}
