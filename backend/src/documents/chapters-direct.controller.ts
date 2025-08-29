import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { ChapterResponseDto, GenerateCoverDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../files/config/multer.config';

@Controller('chapters')
@UseGuards(JwtAuthGuard)
export class ChaptersDirectController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post(':id/cover')
  @HttpCode(HttpStatus.OK)
  async generateCover(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() generateCoverDto: GenerateCoverDto,
  ): Promise<ChapterResponseDto> {
    return this.chaptersService.generateCover(id, user.id, generateCoverDto);
  }

  @Post(':id/cover/upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  @HttpCode(HttpStatus.OK)
  async uploadCover(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ChapterResponseDto> {
    return this.chaptersService.uploadCover(id, user.id, file);
  }
}