import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileStatus } from '@prisma/client';

describe('FilesController', () => {
  let controller: FilesController;
  let filesService: jest.Mocked<FilesService>;

  const mockUser = {
    id: 'user-id-1',
    email: 'test@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
    const mockFilesService = {
      uploadFile: jest.fn(),
      getFile: jest.fn(),
      getUserFiles: jest.fn(),
      deleteFile: jest.fn(),
      updateFileStatus: jest.fn(),
      validateFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
      providers: [
        {
          provide: FilesService,
          useValue: mockFilesService,
        },
      ],
    }).compile();

    controller = module.get<FilesController>(FilesController);
    filesService = module.get(FilesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should successfully upload a file', async () => {
      filesService.uploadFile.mockResolvedValue(mockUploadedFile);

      const result = await controller.uploadFile(mockFile, mockUser);

      expect(filesService.uploadFile).toHaveBeenCalledWith(mockFile, mockUser.id);
      expect(result).toEqual({
        id: mockUploadedFile.id,
        originalName: mockUploadedFile.originalName,
        fileName: mockUploadedFile.fileName,
        mimeType: mockUploadedFile.mimeType,
        size: mockUploadedFile.size,
        status: mockUploadedFile.status,
        createdAt: mockUploadedFile.createdAt,
      });
    });

    it('should throw BadRequestException when no file is provided', async () => {
      await expect(controller.uploadFile(null, mockUser)).rejects.toThrow(
        BadRequestException
      );
      await expect(controller.uploadFile(null, mockUser)).rejects.toThrow(
        'No file provided'
      );
    });

    it('should throw BadRequestException when file is undefined', async () => {
      await expect(controller.uploadFile(undefined, mockUser)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should propagate service errors', async () => {
      filesService.uploadFile.mockRejectedValue(new BadRequestException('Invalid file'));

      await expect(controller.uploadFile(mockFile, mockUser)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('getUserFiles', () => {
    it('should return user files', async () => {
      const mockFiles = [mockUploadedFile];
      filesService.getUserFiles.mockResolvedValue(mockFiles);

      const result = await controller.getUserFiles(mockUser);

      expect(filesService.getUserFiles).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual([
        {
          id: mockUploadedFile.id,
          originalName: mockUploadedFile.originalName,
          fileName: mockUploadedFile.fileName,
          mimeType: mockUploadedFile.mimeType,
          size: mockUploadedFile.size,
          status: mockUploadedFile.status,
          createdAt: mockUploadedFile.createdAt,
        },
      ]);
    });

    it('should return empty array when user has no files', async () => {
      filesService.getUserFiles.mockResolvedValue([]);

      const result = await controller.getUserFiles(mockUser);

      expect(result).toEqual([]);
    });
  });

  describe('getFile', () => {
    it('should return file when found', async () => {
      filesService.getFile.mockResolvedValue(mockUploadedFile);

      const result = await controller.getFile('file-id-1', mockUser);

      expect(filesService.getFile).toHaveBeenCalledWith('file-id-1', mockUser.id);
      expect(result).toEqual({
        id: mockUploadedFile.id,
        originalName: mockUploadedFile.originalName,
        fileName: mockUploadedFile.fileName,
        mimeType: mockUploadedFile.mimeType,
        size: mockUploadedFile.size,
        status: mockUploadedFile.status,
        createdAt: mockUploadedFile.createdAt,
      });
    });

    it('should throw NotFoundException when file not found', async () => {
      filesService.getFile.mockResolvedValue(null);

      await expect(controller.getFile('file-id-1', mockUser)).rejects.toThrow(
        NotFoundException
      );
      await expect(controller.getFile('file-id-1', mockUser)).rejects.toThrow(
        'File not found'
      );
    });
  });

  describe('deleteFile', () => {
    it('should successfully delete file', async () => {
      filesService.deleteFile.mockResolvedValue(undefined);

      const result = await controller.deleteFile('file-id-1', mockUser);

      expect(filesService.deleteFile).toHaveBeenCalledWith('file-id-1', mockUser.id);
      expect(result).toEqual({ message: 'File deleted successfully' });
    });

    it('should propagate service errors', async () => {
      filesService.deleteFile.mockRejectedValue(new BadRequestException('File not found'));

      await expect(controller.deleteFile('file-id-1', mockUser)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});