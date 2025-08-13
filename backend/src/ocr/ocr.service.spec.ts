import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
import * as sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import * as fs from 'fs/promises';

// Mock external dependencies
jest.mock('tesseract.js');
jest.mock('sharp');
jest.mock('fs/promises');

const mockCreateWorker = createWorker as jest.MockedFunction<typeof createWorker>;
const mockSharp = sharp as jest.MockedFunction<typeof sharp>;
const mockFs = fs as jest.Mocked<typeof fs>;

describe('OcrService', () => {
    let service: OcrService;
    let prismaService: any;
    let documentsService: jest.Mocked<DocumentsService>;

    const mockWorker = {
        recognize: jest.fn(),
        terminate: jest.fn(),
    };

    const mockSharpInstance = {
        greyscale: jest.fn().mockReturnThis(),
        normalize: jest.fn().mockReturnThis(),
        sharpen: jest.fn().mockReturnThis(),
        png: jest.fn().mockReturnThis(),
        toFile: jest.fn(),
    };

    // Note: Error messages in test output are expected - they're from testing error handling scenarios

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                OcrService,
                {
                    provide: PrismaService,
                    useValue: {
                        uploadedFile: {
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                        document: {
                            update: jest.fn(),
                        },
                    },
                },
                {
                    provide: DocumentsService,
                    useValue: {
                        create: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<OcrService>(OcrService);
        prismaService = module.get(PrismaService);
        documentsService = module.get(DocumentsService);

        // Reset mocks
        jest.clearAllMocks();
        mockCreateWorker.mockResolvedValue(mockWorker as any);
        mockSharp.mockReturnValue(mockSharpInstance as any);
    });

    describe('preprocessImage', () => {
        it('should preprocess image successfully', async () => {
            const inputPath = '/test/input.jpg';
            const fileId = 'test-file-id';

            mockSharpInstance.toFile.mockResolvedValue(undefined);

            const result = await service.preprocessImage(inputPath, fileId);

            expect(result).toContain('preprocessed_test-file-id.png');
            expect(mockSharp).toHaveBeenCalledWith(inputPath);
            expect(mockSharpInstance.greyscale).toHaveBeenCalled();
            expect(mockSharpInstance.normalize).toHaveBeenCalled();
            expect(mockSharpInstance.sharpen).toHaveBeenCalled();
            expect(mockSharpInstance.png).toHaveBeenCalledWith({ quality: 100 });
        });

        it('should throw error when preprocessing fails', async () => {
            const inputPath = '/test/input.jpg';
            const fileId = 'test-file-id';

            mockSharpInstance.toFile.mockRejectedValue(new Error('Sharp error'));

            await expect(service.preprocessImage(inputPath, fileId)).rejects.toThrow(
                'Image preprocessing failed: Sharp error'
            );
        });
    });

    describe('extractTextFromImage', () => {
        it('should extract text successfully', async () => {
            const imagePath = '/test/image.png';
            const mockText = 'This is extracted text\n\n\nwith multiple   spaces';

            mockWorker.recognize.mockResolvedValue({
                data: { text: mockText }
            });

            const result = await service.extractTextFromImage(imagePath);

            expect(result).toBe('This is extracted text with multiple spaces');
            expect(mockCreateWorker).toHaveBeenCalledWith('eng');
            expect(mockWorker.recognize).toHaveBeenCalledWith(imagePath);
            expect(mockWorker.terminate).toHaveBeenCalled();
        });

        it('should handle OCR errors and terminate worker', async () => {
            const imagePath = '/test/image.png';

            mockWorker.recognize.mockRejectedValue(new Error('OCR failed'));

            await expect(service.extractTextFromImage(imagePath)).rejects.toThrow(
                'Text extraction failed: OCR failed'
            );

            expect(mockWorker.terminate).toHaveBeenCalled();
        });
    });

    describe('createDocumentFromOCR', () => {
        it('should create document from OCR results', async () => {
            const userId = 'user-123';
            const extractedText = 'Extracted text content';
            const originalFileName = 'test_document.jpg';

            const mockDocument = {
                id: 'doc-123',
                title: 'Test Document (OCR)',
                content: extractedText,
            };

            documentsService.create.mockResolvedValue(mockDocument as any);

            const result = await service.createDocumentFromOCR(userId, extractedText, originalFileName);

            expect(documentsService.create).toHaveBeenCalledWith(userId, {
                title: 'Test Document (OCR)',
                content: extractedText,
                documentType: 'OCR_PROCESSED',
                originalFileName,
            });

            expect(result).toEqual(mockDocument);
        });
    });

    describe('getOcrStatus', () => {
        it('should return cached job status', async () => {
            const fileId = 'file-123';
            const mockStatus = {
                id: fileId,
                status: 'PROCESSING' as const,
                progress: 50,
                message: 'Processing...',
                createdAt: new Date(),
            };

            // Simulate cached status
            (service as any).ocrJobs.set(fileId, mockStatus);

            const result = await service.getOcrStatus(fileId);

            expect(result).toEqual(mockStatus);
        });

        it('should fetch status from database when not cached', async () => {
            const fileId = 'file-123';
            const mockFile = {
                id: fileId,
                status: 'PROCESSED',
                createdAt: new Date(),
            };

            prismaService.uploadedFile.findUnique.mockResolvedValue(mockFile as any);

            const result = await service.getOcrStatus(fileId);

            expect(result.id).toBe(fileId);
            expect(result.status).toBe('PROCESSED');
            expect(result.progress).toBe(100);
        });

        it('should throw NotFoundException when file not found', async () => {
            const fileId = 'nonexistent-file';

            prismaService.uploadedFile.findUnique.mockResolvedValue(null);

            await expect(service.getOcrStatus(fileId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('retryOcrProcessing', () => {
        it('should retry OCR processing for existing file', async () => {
            const fileId = 'file-123';
            const userId = 'user-123';
            const mockFile = {
                id: fileId,
                userId,
                filePath: '/test/file.jpg',
                originalName: 'test.jpg',
            };

            prismaService.uploadedFile.findUnique.mockResolvedValue(mockFile as any);

            // Mock the processImage method
            const processImageSpy = jest.spyOn(service, 'processImage').mockResolvedValue({
                id: fileId,
                status: 'PROCESSING',
                progress: 0,
                createdAt: new Date(),
            });

            await service.retryOcrProcessing(fileId, userId);

            expect(prismaService.uploadedFile.findUnique).toHaveBeenCalledWith({
                where: { id: fileId },
            });

            expect(processImageSpy).toHaveBeenCalledWith(
                fileId,
                mockFile.filePath,
                userId,
                mockFile.originalName
            );
        });

        it('should throw NotFoundException when file not found', async () => {
            const fileId = 'nonexistent-file';
            const userId = 'user-123';

            prismaService.uploadedFile.findUnique.mockResolvedValue(null);

            await expect(service.retryOcrProcessing(fileId, userId)).rejects.toThrow(NotFoundException);
        });

        it('should throw NotFoundException when user does not own file', async () => {
            const fileId = 'file-123';
            const userId = 'user-123';
            const mockFile = {
                id: fileId,
                userId: 'different-user',
                filePath: '/test/file.jpg',
                originalName: 'test.jpg',
            };

            prismaService.uploadedFile.findUnique.mockResolvedValue(mockFile as any);

            await expect(service.retryOcrProcessing(fileId, userId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('processImage', () => {
        it('should process image successfully end-to-end', async () => {
            const fileId = 'file-123';
            const filePath = '/test/input.jpg';
            const userId = 'user-123';
            const originalFileName = 'test.jpg';

            const mockDocument = {
                id: 'doc-123',
                title: 'Test (OCR)',
                content: 'Extracted text',
            };

            // Mock all dependencies
            mockSharpInstance.toFile.mockResolvedValue(undefined);
            mockWorker.recognize.mockResolvedValue({
                data: { text: 'Extracted text' }
            });
            documentsService.create.mockResolvedValue(mockDocument as any);
            prismaService.uploadedFile.update.mockResolvedValue({} as any);
            mockFs.unlink.mockResolvedValue(undefined);

            const result = await service.processImage(fileId, filePath, userId, originalFileName);

            expect(result.status).toBe('PROCESSED');
            expect(result.progress).toBe(100);
            expect(result.documentId).toBe('doc-123');
            expect(prismaService.uploadedFile.update).toHaveBeenCalledWith({
                where: { id: fileId },
                data: { status: 'PROCESSED' },
            });
        });

        it('should handle processing errors gracefully', async () => {
            const fileId = 'file-123';
            const filePath = '/test/input.jpg';
            const userId = 'user-123';
            const originalFileName = 'test.jpg';

            // Mock preprocessing to fail
            mockSharpInstance.toFile.mockRejectedValue(new Error('Processing failed'));
            prismaService.uploadedFile.update.mockResolvedValue({} as any);

            await expect(service.processImage(fileId, filePath, userId, originalFileName)).rejects.toThrow();

            // Verify error status was set
            expect(prismaService.uploadedFile.update).toHaveBeenCalledWith({
                where: { id: fileId },
                data: { status: 'FAILED' },
            });
        });
    });
});