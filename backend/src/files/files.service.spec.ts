import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileStatus } from '@prisma/client';

describe('FilesService', () => {
  let service: FilesService;
  let prismaService: any;

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('test file content'),
    destination: '',
    filename: '',
    path: '',
    stream: null,
  };

  const mockUploadedFile = {
    id: 'file-id-1',
    originalName: 'test.jpg',
    fileName: 'test-file.jpg',
    filePath: 'uploads/test-file.jpg',
    mimeType: 'image/jpeg',
    size: 1024,
    userId: 'user-id-1',
    status: FileStatus.UPLOADED,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      uploadedFile: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FilesService>(FilesService);
    prismaService = module.get(PrismaService) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFile', () => {
    it('should throw BadRequestException when no file is provided', () => {
      expect(() => service.validateFile(null)).toThrow(BadRequestException);
      expect(() => service.validateFile(null)).toThrow('No file provided');
    });

    it('should throw BadRequestException for invalid file type', () => {
      const invalidFile = { ...mockFile, mimetype: 'text/plain' };
      
      expect(() => service.validateFile(invalidFile)).toThrow(BadRequestException);
      expect(() => service.validateFile(invalidFile)).toThrow('Invalid file type');
    });

    it('should throw BadRequestException for file size too large', () => {
      const largeFile = { ...mockFile, size: 11 * 1024 * 1024 }; // 11MB
      
      expect(() => service.validateFile(largeFile)).toThrow(BadRequestException);
      expect(() => service.validateFile(largeFile)).toThrow('File size too large');
    });

    it('should pass validation for valid file', () => {
      expect(() => service.validateFile(mockFile)).not.toThrow();
    });

    it('should accept all allowed mime types', () => {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      
      allowedTypes.forEach(mimeType => {
        const file = { ...mockFile, mimetype: mimeType };
        expect(() => service.validateFile(file)).not.toThrow();
      });
    });
  });

  describe('uploadFile', () => {
    it('should throw BadRequestException for invalid file', async () => {
      const invalidFile = { ...mockFile, mimetype: 'text/plain' };

      await expect(service.uploadFile(invalidFile, 'user-id-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('getFile', () => {
    it('should return file when found', async () => {
      prismaService.uploadedFile.findFirst.mockResolvedValue(mockUploadedFile);

      const result = await service.getFile('file-id-1', 'user-id-1');

      expect(prismaService.uploadedFile.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'file-id-1',
          userId: 'user-id-1',
        },
      });
      expect(result).toEqual(mockUploadedFile);
    });

    it('should return null when file not found', async () => {
      prismaService.uploadedFile.findFirst.mockResolvedValue(null);

      const result = await service.getFile('file-id-1', 'user-id-1');

      expect(result).toBeNull();
    });
  });

  describe('getUserFiles', () => {
    it('should return user files ordered by creation date', async () => {
      const mockFiles = [mockUploadedFile];
      prismaService.uploadedFile.findMany.mockResolvedValue(mockFiles);

      const result = await service.getUserFiles('user-id-1');

      expect(prismaService.uploadedFile.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id-1',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(mockFiles);
    });
  });

  describe('deleteFile', () => {
    it('should throw BadRequestException when file not found', async () => {
      prismaService.uploadedFile.findFirst.mockResolvedValue(null);

      await expect(service.deleteFile('file-id-1', 'user-id-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('updateFileStatus', () => {
    it('should update file status', async () => {
      const updatedFile = { ...mockUploadedFile, status: FileStatus.PROCESSING };
      prismaService.uploadedFile.update.mockResolvedValue(updatedFile);

      const result = await service.updateFileStatus('file-id-1', FileStatus.PROCESSING);

      expect(prismaService.uploadedFile.update).toHaveBeenCalledWith({
        where: {
          id: 'file-id-1',
        },
        data: {
          status: FileStatus.PROCESSING,
        },
      });
      expect(result).toEqual(updatedFile);
    });
  });
});