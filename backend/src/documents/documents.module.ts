import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { BooksService } from './books.service';
import { ChaptersService } from './chapters.service';
import { BooksController } from './books.controller';
import { ChaptersController } from './chapters.controller';
import { ChaptersDirectController } from './chapters-direct.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AIImageModule } from '../ai-image/ai-image.module';

@Module({
  imports: [PrismaModule, AIImageModule],
  controllers: [
    DocumentsController,
    BooksController,
    ChaptersController,
    ChaptersDirectController,
  ],
  providers: [
    DocumentsService,
    BooksService,
    ChaptersService,
  ],
  exports: [
    DocumentsService,
    BooksService,
    ChaptersService,
  ],
})
export class DocumentsModule {}