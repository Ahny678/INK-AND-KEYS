import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChapterDto, UpdateChapterDto, ChapterResponseDto } from './dto';
import { Chapter } from '@prisma/client';

@Injectable()
export class ChaptersService {
  constructor(private prisma: PrismaService) {}

  async create(bookId: string, userId: string, createChapterDto: CreateChapterDto): Promise<ChapterResponseDto> {
    // First verify the book exists and user owns it
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    if (book.userId !== userId) {
      throw new ForbiddenException('You do not have permission to add chapters to this book');
    }

    // If no order is provided, get the next available order
    let order = createChapterDto.order;
    if (!order) {
      const lastChapter = await this.prisma.chapter.findFirst({
        where: { bookId },
        orderBy: { order: 'desc' },
      });
      order = lastChapter ? lastChapter.order + 1 : 1;
    }

    const chapter = await this.prisma.chapter.create({
      data: {
        title: createChapterDto.title,
        content: createChapterDto.content || '',
        order,
        bookId,
      },
    });

    return this.mapToResponseDto(chapter);
  }

  async findAllByBook(bookId: string, userId: string): Promise<ChapterResponseDto[]> {
    // First verify the book exists and user owns it
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    if (book.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access chapters from this book');
    }

    const chapters = await this.prisma.chapter.findMany({
      where: { bookId },
      orderBy: { order: 'asc' },
    });

    return chapters.map(chapter => this.mapToResponseDto(chapter));
  }

  async findOne(id: string, userId: string): Promise<ChapterResponseDto> {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: {
        book: true,
      },
    });

    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${id} not found`);
    }

    if (chapter.book.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this chapter');
    }

    return this.mapToResponseDto(chapter);
  }

  async update(id: string, userId: string, updateChapterDto: UpdateChapterDto): Promise<ChapterResponseDto> {
    // First check if chapter exists and user owns it
    await this.findOne(id, userId);

    const chapter = await this.prisma.chapter.update({
      where: { id },
      data: {
        ...updateChapterDto,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponseDto(chapter);
  }

  async remove(id: string, userId: string): Promise<void> {
    // First check if chapter exists and user owns it
    await this.findOne(id, userId);

    await this.prisma.chapter.delete({
      where: { id },
    });
  }

  async reorderChapters(bookId: string, userId: string, chapterIds: string[]): Promise<ChapterResponseDto[]> {
    // First verify the book exists and user owns it
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    if (book.userId !== userId) {
      throw new ForbiddenException('You do not have permission to reorder chapters in this book');
    }

    // Verify all chapters belong to this book
    const chapters = await this.prisma.chapter.findMany({
      where: { 
        id: { in: chapterIds },
        bookId 
      },
    });

    if (chapters.length !== chapterIds.length) {
      throw new BadRequestException('Some chapters do not belong to this book');
    }

    // Update the order of all chapters
    const updates = chapterIds.map((chapterId, index) => 
      this.prisma.chapter.update({
        where: { id: chapterId },
        data: { order: index + 1 },
      })
    );

    await this.prisma.$transaction(updates);

    // Return the updated chapters
    return this.findAllByBook(bookId, userId);
  }

  private mapToResponseDto(chapter: Chapter): ChapterResponseDto {
    return {
      id: chapter.id,
      title: chapter.title,
      content: chapter.content,
      order: chapter.order,
      bookId: chapter.bookId,
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
    };
  }
}
