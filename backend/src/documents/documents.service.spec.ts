import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    document: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockDocument = {
    id: 'doc-1',
    title: 'Test Document',
    content: 'Test content',
    userId: 'user-1',
    documentType: DocumentType.CREATED,
    originalFileName: null,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new document', async () => {
      const createDocumentDto = {
        title: 'Test Document',
        content: 'Test content',
      };

      mockPrismaService.document.create.mockResolvedValue(mockDocument);

      const result = await service.create('user-1', createDocumentDto);

      expect(mockPrismaService.document.create).toHaveBeenCalledWith({
        data: {
          title: createDocumentDto.title,
          content: createDocumentDto.content,
          userId: 'user-1',
          documentType: DocumentType.CREATED,
          originalFileName: undefined,
        },
      });
      expect(result).toEqual({
        id: mockDocument.id,
        title: mockDocument.title,
        content: mockDocument.content,
        userId: mockDocument.userId,
        documentType: mockDocument.documentType,
        originalFileName: mockDocument.originalFileName,
        createdAt: mockDocument.createdAt,
        updatedAt: mockDocument.updatedAt,
      });
    });

    it('should create a document with default empty content', async () => {
      const createDocumentDto = {
        title: 'Test Document',
      };

      mockPrismaService.document.create.mockResolvedValue(mockDocument);

      await service.create('user-1', createDocumentDto);

      expect(mockPrismaService.document.create).toHaveBeenCalledWith({
        data: {
          title: createDocumentDto.title,
          content: '',
          userId: 'user-1',
          documentType: DocumentType.CREATED,
          originalFileName: undefined,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all documents for a user', async () => {
      const documents = [mockDocument];
      mockPrismaService.document.findMany.mockResolvedValue(documents);

      const result = await service.findAll('user-1');

      expect(mockPrismaService.document.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { updatedAt: 'desc' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockDocument.id,
        title: mockDocument.title,
        content: mockDocument.content,
        userId: mockDocument.userId,
        documentType: mockDocument.documentType,
        originalFileName: mockDocument.originalFileName,
        createdAt: mockDocument.createdAt,
        updatedAt: mockDocument.updatedAt,
      });
    });
  });

  describe('findOne', () => {
    it('should return a document if user owns it', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(mockDocument);

      const result = await service.findOne('doc-1', 'user-1');

      expect(mockPrismaService.document.findUnique).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
      });
      expect(result).toEqual({
        id: mockDocument.id,
        title: mockDocument.title,
        content: mockDocument.content,
        userId: mockDocument.userId,
        documentType: mockDocument.documentType,
        originalFileName: mockDocument.originalFileName,
        createdAt: mockDocument.createdAt,
        updatedAt: mockDocument.updatedAt,
      });
    });

    it('should throw NotFoundException if document does not exist', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(service.findOne('doc-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user does not own the document', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue({
        ...mockDocument,
        userId: 'other-user',
      });

      await expect(service.findOne('doc-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a document if user owns it', async () => {
      const updateDocumentDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      mockPrismaService.document.findUnique.mockResolvedValue(mockDocument);
      mockPrismaService.document.update.mockResolvedValue({
        ...mockDocument,
        ...updateDocumentDto,
      });

      const result = await service.update('doc-1', 'user-1', updateDocumentDto);

      expect(mockPrismaService.document.update).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
        data: {
          ...updateDocumentDto,
          updatedAt: expect.any(Date),
        },
      });
      expect(result.title).toBe(updateDocumentDto.title);
      expect(result.content).toBe(updateDocumentDto.content);
    });

    it('should throw NotFoundException if document does not exist', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(
        service.update('doc-1', 'user-1', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a document if user owns it', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(mockDocument);
      mockPrismaService.document.delete.mockResolvedValue(mockDocument);

      await service.remove('doc-1', 'user-1');

      expect(mockPrismaService.document.delete).toHaveBeenCalledWith({
        where: { id: 'doc-1' },
      });
    });

    it('should throw NotFoundException if document does not exist', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(service.remove('doc-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});