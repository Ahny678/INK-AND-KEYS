import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto, DocumentResponseDto } from './dto';
import { Document, DocumentType } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDocumentDto: CreateDocumentDto): Promise<DocumentResponseDto> {
    const document = await this.prisma.document.create({
      data: {
        title: createDocumentDto.title,
        content: createDocumentDto.content || '',
        userId,
        documentType: createDocumentDto.documentType || DocumentType.CREATED,
        originalFileName: createDocumentDto.originalFileName,
      },
    });

    return this.mapToResponseDto(document);
  }

  async findAll(userId: string): Promise<DocumentResponseDto[]> {
    const documents = await this.prisma.document.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return documents.map(doc => this.mapToResponseDto(doc));
  }

  async findOne(id: string, userId: string): Promise<DocumentResponseDto> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    if (document.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access this document');
    }

    return this.mapToResponseDto(document);
  }

  async update(id: string, userId: string, updateDocumentDto: UpdateDocumentDto): Promise<DocumentResponseDto> {
    // First check if document exists and user owns it
    await this.findOne(id, userId);

    const document = await this.prisma.document.update({
      where: { id },
      data: {
        ...updateDocumentDto,
        updatedAt: new Date(),
      },
    });

    return this.mapToResponseDto(document);
  }

  async remove(id: string, userId: string): Promise<void> {
    // First check if document exists and user owns it
    await this.findOne(id, userId);

    await this.prisma.document.delete({
      where: { id },
    });
  }

  private mapToResponseDto(document: Document): DocumentResponseDto {
    return {
      id: document.id,
      title: document.title,
      content: document.content,
      userId: document.userId,
      documentType: document.documentType,
      originalFileName: document.originalFileName,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}