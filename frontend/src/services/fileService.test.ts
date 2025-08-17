import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fileService } from './fileService';
import { api } from './api';

// Mock the api module
vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('FileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateFile', () => {
    it('validates file type correctly', () => {
      const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      expect(fileService.validateFile(validFile)).toEqual({ isValid: true });
      expect(fileService.validateFile(invalidFile)).toEqual({
        isValid: false,
        error: 'Invalid file type. Allowed types: image/jpeg, image/jpg, image/png, application/pdf',
      });
    });

    it('validates file size correctly', () => {
      const validFile = new File(['x'.repeat(1024)], 'test.jpg', { type: 'image/jpeg' });
      const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

      expect(fileService.validateFile(validFile)).toEqual({ isValid: true });
      expect(fileService.validateFile(largeFile)).toEqual({
        isValid: false,
        error: 'File size too large. Maximum size: 10MB',
      });
    });
  });

  describe('uploadFile', () => {
    it('uploads file successfully', async () => {
      const mockResponse = {
        data: {
          id: 'file-123',
          originalName: 'test.jpg',
          fileName: 'uploaded_test.jpg',
          mimeType: 'image/jpeg',
          size: 1024,
          status: 'UPLOADED',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await fileService.uploadFile(file);

      expect(api.post).toHaveBeenCalledWith('/files/upload', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('processOCR', () => {
    it('starts OCR processing successfully', async () => {
      const mockResponse = {
        data: {
          message: 'OCR processing started',
          jobId: 'file-123',
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await fileService.processOCR('file-123', 'path/to/file.jpg', 'original.jpg');

      expect(api.post).toHaveBeenCalledWith('/ocr/process', {
        fileId: 'file-123',
        filePath: 'path/to/file.jpg',
        originalFileName: 'original.jpg',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getOCRStatus', () => {
    it('gets OCR status successfully', async () => {
      const mockResponse = {
        data: {
          id: 'file-123',
          status: 'PROCESSING',
          progress: 50,
          message: 'Processing image...',
          createdAt: '2023-01-01T00:00:00Z',
        },
      };

      (api.get as any).mockResolvedValue(mockResponse);

      const result = await fileService.getOCRStatus('file-123');

      expect(api.get).toHaveBeenCalledWith('/ocr/status/file-123');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('retryOCR', () => {
    it('retries OCR processing successfully', async () => {
      const mockResponse = {
        data: {
          message: 'OCR retry started',
          jobId: 'file-123',
        },
      };

      (api.post as any).mockResolvedValue(mockResponse);

      const result = await fileService.retryOCR('file-123');

      expect(api.post).toHaveBeenCalledWith('/ocr/retry/file-123');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getUserFiles', () => {
    it('gets user files successfully', async () => {
      const mockResponse = {
        data: [
          {
            id: 'file-123',
            originalName: 'test.jpg',
            fileName: 'uploaded_test.jpg',
            mimeType: 'image/jpeg',
            size: 1024,
            status: 'PROCESSED',
            createdAt: '2023-01-01T00:00:00Z',
          },
        ],
      };

      (api.get as any).mockResolvedValue(mockResponse);

      const result = await fileService.getUserFiles();

      expect(api.get).toHaveBeenCalledWith('/files');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteFile', () => {
    it('deletes file successfully', async () => {
      const mockResponse = {
        data: { message: 'File deleted successfully' },
      };

      (api.delete as any).mockResolvedValue(mockResponse);

      const result = await fileService.deleteFile('file-123');

      expect(api.delete).toHaveBeenCalledWith('/files/file-123');
      expect(result).toEqual(mockResponse.data);
    });
  });
});