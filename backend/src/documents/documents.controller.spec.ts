import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentType } from '@prisma/client';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  const mockDocumentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDocumentResponse = {
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
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
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

      mockDocumentsService.create.mockResolvedValue(mockDocumentResponse);

      const result = await controller.create(mockUser, createDocumentDto);

      expect(mockDocumentsService.create).toHaveBeenCalledWith(
        mockUser.id,
        createDocumentDto,
      );
      expect(result).toEqual(mockDocumentResponse);
    });
  });

  describe('findAll', () => {
    it('should return all documents for the user', async () => {
      const documents = [mockDocumentResponse];
      mockDocumentsService.findAll.mockResolvedValue(documents);

      const result = await controller.findAll(mockUser);

      expect(mockDocumentsService.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(documents);
    });
  });

  describe('findOne', () => {
    it('should return a specific document', async () => {
      mockDocumentsService.findOne.mockResolvedValue(mockDocumentResponse);

      const result = await controller.findOne('doc-1', mockUser);

      expect(mockDocumentsService.findOne).toHaveBeenCalledWith(
        'doc-1',
        mockUser.id,
      );
      expect(result).toEqual(mockDocumentResponse);
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const updateDocumentDto = {
        title: 'Updated Title',
        content: 'Updated content',
      };

      const updatedDocument = {
        ...mockDocumentResponse,
        ...updateDocumentDto,
      };

      mockDocumentsService.update.mockResolvedValue(updatedDocument);

      const result = await controller.update('doc-1', mockUser, updateDocumentDto);

      expect(mockDocumentsService.update).toHaveBeenCalledWith(
        'doc-1',
        mockUser.id,
        updateDocumentDto,
      );
      expect(result).toEqual(updatedDocument);
    });
  });

  describe('remove', () => {
    it('should delete a document', async () => {
      mockDocumentsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('doc-1', mockUser);

      expect(mockDocumentsService.remove).toHaveBeenCalledWith(
        'doc-1',
        mockUser.id,
      );
      expect(result).toBeUndefined();
    });
  });
});