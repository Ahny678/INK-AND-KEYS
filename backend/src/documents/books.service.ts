import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto, UpdateBookDto, BookResponseDto } from './dto';
import { Book } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBookDto: CreateBookDto): Promise<BookResponseDto> {
    const book = await this.prisma.book.create({
      data: {
        title: createBookDto.title,
        description: createBookDto.description || '',
        userId,
      },
      include: {
            _count: {
              select: {
                chapters: true,
              },
            },
          },
    });

    return this.mapToResponseDto(book);
  }

  async findAll(userId: string): Promise<BookResponseDto[]> {
    const books = await this.prisma.book.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            chapters: true,
          },
        },
      },
    });

    return books.map(book => this.mapToResponseDto(book));
  }

  async findOne(id: string, userId: string): Promise<BookResponseDto> {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            chapters: true,
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    if (book.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this book');
    }

    return this.mapToResponseDto(book);
  }

  async update(id: string, userId: string, updateBookDto: UpdateBookDto): Promise<BookResponseDto> {
    // First check if book exists and user owns it
    await this.findOne(id, userId);

    const book = await this.prisma.book.update({
      where: { id },
      data: {
        ...updateBookDto,
        updatedAt: new Date(),
      },
      include: {
        _count: {
          select: {
            chapters: true,
          },
        },
      },
    });

    return this.mapToResponseDto(book);
  }

  async remove(id: string, userId: string): Promise<void> {
    // First check if book exists and user owns it
    await this.findOne(id, userId);

    // Delete the book (chapters will be deleted automatically due to cascade)
    await this.prisma.book.delete({
      where: { id },
    });
  }

  private mapToResponseDto(book: Book & { _count?: { chapters: number } }): BookResponseDto {
    return {
      id: book.id,
      title: book.title,
      description: book.description,
      userId: book.userId,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      _count: book._count,
    };
  }
}
