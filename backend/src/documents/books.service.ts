import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto, UpdateBookDto, BookResponseDto, GenerateCoverDto } from './dto';
import { Book } from '@prisma/client';
import { AIImageService } from '../ai-image/ai-image.service';

@Injectable()
export class BooksService {
  constructor(
    private prisma: PrismaService,
    private aiImageService: AIImageService,
  ) {}

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
    const book = await this.findOne(id, userId);

    // Clean up cover image from Cloudinary if it exists
    if (book.coverImagePublicId) {
      await this.aiImageService.deleteFromCloudinary(book.coverImagePublicId);
    }

    // Get all chapters to clean up their cover images
    const chapters = await this.prisma.chapter.findMany({
      where: { bookId: id },
      select: { coverImagePublicId: true },
    });

    // Clean up chapter cover images
    for (const chapter of chapters) {
      if (chapter.coverImagePublicId) {
        await this.aiImageService.deleteFromCloudinary(chapter.coverImagePublicId);
      }
    }

    // Delete the book (chapters will be deleted automatically due to cascade)
    await this.prisma.book.delete({
      where: { id },
    });
  }

  async generateCover(id: string, userId: string, generateCoverDto: GenerateCoverDto): Promise<BookResponseDto> {
    // First check if book exists and user owns it
    const existingBook = await this.findOne(id, userId);

    // Clean up existing cover image if it exists
    if (existingBook.coverImagePublicId) {
      await this.aiImageService.deleteFromCloudinary(existingBook.coverImagePublicId);
    }

    // Generate new cover image
    const generatedImage = await this.aiImageService.generateCoverImage(generateCoverDto.prompt, 'book');

    // Update book with new cover image
    const book = await this.prisma.book.update({
      where: { id },
      data: {
        coverImageUrl: generatedImage.url,
        coverImagePublicId: generatedImage.publicId,
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

  async uploadCover(id: string, userId: string, file: Express.Multer.File): Promise<BookResponseDto> {
    // First check if book exists and user owns it
    const existingBook = await this.findOne(id, userId);

    // Validate file is an image
    if (!file || !file.mimetype.startsWith('image/')) {
      throw new ForbiddenException('Only image files are allowed for cover upload');
    }

    // Clean up existing cover image if it exists
    if (existingBook.coverImagePublicId) {
      await this.aiImageService.deleteFromCloudinary(existingBook.coverImagePublicId);
    }

    // Upload new cover image to Cloudinary
    const folder = `ink-and-keys/book-covers`;
    const upload = await this.aiImageService.uploadToCloudinary(file.buffer, folder);

    // Update book with new cover image
    const book = await this.prisma.book.update({
      where: { id },
      data: {
        coverImageUrl: upload.url,
        coverImagePublicId: upload.publicId,
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

  private mapToResponseDto(book: Book & { _count?: { chapters: number } }): BookResponseDto {
    return {
      id: book.id,
      title: book.title,
      description: book.description,
      coverImageUrl: book.coverImageUrl,
      coverImagePublicId: book.coverImagePublicId,
      userId: book.userId,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      _count: book._count,
    };
  }
}
