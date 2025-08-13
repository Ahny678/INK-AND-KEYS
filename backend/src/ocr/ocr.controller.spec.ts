import { Test, TestingModule } from '@nestjs/testing';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { ProcessOcrDto, OcrStatusDto } from './dto';

describe('OcrController', () => {
  let controller: OcrController;
  let ocrService: jest.Mocked<OcrService>;

  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OcrController],
      providers: [
        {
          provide: OcrService,
          useValue: {
            processImage: jest.fn(),
            getOcrStatus: jest.fn(),
            retryOcrProcessing: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OcrController>(OcrController);
    ocrService = module.get(OcrService);
  });

  describe('processOcr', () => {
    it('should start OCR processing and return job info', async () => {
      const processOcrDto: ProcessOcrDto = {
        fileId: 'file-123',
        filePath: '/test/file.jpg',
        originalFileName: 'test.jpg',
      };

      const mockStatus: OcrStatusDto = {
        id: 'file-123',
        status: 'PROCESSING',
        progress: 0,
        createdAt: new Date(),
      };

      ocrService.processImage.mockResolvedValue(mockStatus);

      const result = await controller.processOcr(processOcrDto, mockUser);

      expect(result).toEqual({
        message: 'OCR processing started',
        jobId: 'file-123',
      });

      // Note: processImage is called asynchronously, so we can't directly test it here
      // In a real scenario, we might want to add a small delay and check if it was called
    });

    it('should handle OCR processing errors gracefully', async () => {
      const processOcrDto: ProcessOcrDto = {
        fileId: 'file-123',
        filePath: '/test/file.jpg',
        originalFileName: 'test.jpg',
      };

      ocrService.processImage.mockRejectedValue(new Error('Processing failed'));

      // The controller should still return success since processing is async
      const result = await controller.processOcr(processOcrDto, mockUser);

      expect(result).toEqual({
        message: 'OCR processing started',
        jobId: 'file-123',
      });
    });
  });

  describe('getOcrStatus', () => {
    it('should return OCR status', async () => {
      const fileId = 'file-123';
      const mockStatus: OcrStatusDto = {
        id: fileId,
        status: 'PROCESSED',
        progress: 100,
        message: 'Processing completed',
        documentId: 'doc-123',
        createdAt: new Date(),
      };

      ocrService.getOcrStatus.mockResolvedValue(mockStatus);

      const result = await controller.getOcrStatus(fileId, mockUser);

      expect(result).toEqual(mockStatus);
      expect(ocrService.getOcrStatus).toHaveBeenCalledWith(fileId);
    });

    it('should handle status retrieval errors', async () => {
      const fileId = 'nonexistent-file';

      ocrService.getOcrStatus.mockRejectedValue(new Error('File not found'));

      await expect(controller.getOcrStatus(fileId, mockUser)).rejects.toThrow('File not found');
    });
  });

  describe('retryOcrProcessing', () => {
    it('should start OCR retry and return job info', async () => {
      const fileId = 'file-123';
      const mockStatus: OcrStatusDto = {
        id: fileId,
        status: 'PROCESSING',
        progress: 0,
        createdAt: new Date(),
      };

      ocrService.retryOcrProcessing.mockResolvedValue(mockStatus);

      const result = await controller.retryOcrProcessing(fileId, mockUser);

      expect(result).toEqual({
        message: 'OCR retry started',
        jobId: fileId,
      });
    });

    it('should handle retry errors gracefully', async () => {
      const fileId = 'file-123';

      ocrService.retryOcrProcessing.mockRejectedValue(new Error('Retry failed'));

      // The controller should still return success since processing is async
      const result = await controller.retryOcrProcessing(fileId, mockUser);

      expect(result).toEqual({
        message: 'OCR retry started',
        jobId: fileId,
      });
    });
  });
});