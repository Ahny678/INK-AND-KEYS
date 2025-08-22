import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { BooksService } from './books.service';
import { ChaptersService } from './chapters.service';
import { BooksController } from './books.controller';
import { ChaptersController } from './chapters.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    DocumentsController,
    BooksController,
    ChaptersController,
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