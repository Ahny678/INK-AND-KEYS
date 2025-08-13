import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { createWorker } from 'tesseract.js';
import * as sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
import { OcrStatusDto } from './dto';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);
  private readonly ocrJobs = new Map<string, OcrStatusDto>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
  ) {}

  async processImage(fileId: string, filePath: string, userId: string, originalFileName: string): Promise<OcrStatusDto> {
    this.logger.log(`Starting OCR processing for file: ${fileId}`);
    
    // Initialize job status
    const jobStatus: OcrStatusDto = {
      id: fileId,
      status: 'PROCESSING',
      progress: 0,
      message: 'Starting OCR processing...',
      createdAt: new Date(),
    };
    
    this.ocrJobs.set(fileId, jobStatus);

    // Update file status in database
    await this.updateFileStatus(fileId, 'PROCESSING');

    try {
      // Preprocess image for better OCR accuracy
      const preprocessedImagePath = await this.preprocessImage(filePath, fileId);
      
      // Update progress
      jobStatus.progress = 25;
      jobStatus.message = 'Image preprocessed, starting text extraction...';
      this.ocrJobs.set(fileId, jobStatus);

      // Extract text using Tesseract
      const extractedText = await this.extractTextFromImage(preprocessedImagePath);
      
      // Update progress
      jobStatus.progress = 75;
      jobStatus.message = 'Text extracted, creating document...';
      this.ocrJobs.set(fileId, jobStatus);

      // Create document from OCR results
      const document = await this.createDocumentFromOCR(userId, extractedText, originalFileName);
      
      // Update final status
      jobStatus.status = 'PROCESSED';
      jobStatus.progress = 100;
      jobStatus.message = 'OCR processing completed successfully';
      jobStatus.documentId = document.id;
      this.ocrJobs.set(fileId, jobStatus);

      // Update file status in database
      await this.updateFileStatus(fileId, 'PROCESSED');

      // Clean up preprocessed image
      await this.cleanupFile(preprocessedImagePath);

      this.logger.log(`OCR processing completed successfully for file: ${fileId}`);
      return jobStatus;

    } catch (error) {
      this.logger.error(`OCR processing failed for file: ${fileId}`, error.stack);
      
      jobStatus.status = 'FAILED';
      jobStatus.message = `OCR processing failed: ${error.message}`;
      this.ocrJobs.set(fileId, jobStatus);

      // Update file status in database
      await this.updateFileStatus(fileId, 'FAILED');

      throw error;
    }
  }

  async preprocessImage(inputPath: string, fileId: string): Promise<string> {
    this.logger.log(`Preprocessing image: ${inputPath}`);
    
    const outputPath = path.join(path.dirname(inputPath), `preprocessed_${fileId}.png`);
    
    try {
      await sharp(inputPath)
        .greyscale() // Convert to grayscale
        .normalize() // Normalize contrast
        .sharpen() // Enhance edges
        .png({ quality: 100 }) // Save as high-quality PNG
        .toFile(outputPath);
      
      this.logger.log(`Image preprocessed successfully: ${outputPath}`);
      return outputPath;
    } catch (error) {
      this.logger.error(`Image preprocessing failed: ${error.message}`);
      throw new Error(`Image preprocessing failed: ${error.message}`);
    }
  }

  async extractTextFromImage(imagePath: string): Promise<string> {
    this.logger.log(`Extracting text from image: ${imagePath}`);
    
    const worker = await createWorker('eng');
    
    try {
      const { data: { text } } = await worker.recognize(imagePath);
      await worker.terminate();
      
      // Clean up extracted text
      const cleanedText = this.cleanExtractedText(text);
      
      this.logger.log(`Text extraction completed. Length: ${cleanedText.length} characters`);
      return cleanedText;
    } catch (error) {
      await worker.terminate();
      this.logger.error(`Text extraction failed: ${error.message}`);
      throw new Error(`Text extraction failed: ${error.message}`);
    }
  }

  private cleanExtractedText(text: string): string {
    return text
      .trim()
      .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newlines
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\S\n]{2,}/g, ' '); // Clean up other whitespace but preserve newlines
  }

  async createDocumentFromOCR(userId: string, extractedText: string, originalFileName: string) {
    this.logger.log(`Creating document from OCR results for user: ${userId}`);
    
    // Generate a title from the original filename
    const title = this.generateDocumentTitle(originalFileName);
    
    const document = await this.documentsService.create(userId, {
      title,
      content: extractedText,
      documentType: 'OCR_PROCESSED' as any,
      originalFileName,
    });

    this.logger.log(`Document created successfully from OCR: ${document.id}`);
    return document;
  }

  private generateDocumentTitle(originalFileName: string): string {
    // Remove file extension and clean up the name
    const nameWithoutExt = path.parse(originalFileName).name;
    const cleanName = nameWithoutExt
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    return `${cleanName} (OCR)`;
  }

  async getOcrStatus(fileId: string): Promise<OcrStatusDto> {
    const status = this.ocrJobs.get(fileId);
    if (!status) {
      // Check database for file status
      const file = await this.prisma.uploadedFile.findUnique({
        where: { id: fileId },
      });
      
      if (!file) {
        throw new NotFoundException(`OCR job not found: ${fileId}`);
      }
      
      return {
        id: fileId,
        status: file.status as any,
        progress: file.status === 'PROCESSED' ? 100 : 0,
        message: `File status: ${file.status}`,
        createdAt: file.createdAt,
      };
    }
    
    return status;
  }

  private async updateFileStatus(fileId: string, status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED') {
    await this.prisma.uploadedFile.update({
      where: { id: fileId },
      data: { status },
    });
  }

  private async cleanupFile(filePath: string) {
    try {
      await fs.unlink(filePath);
      this.logger.log(`Cleaned up file: ${filePath}`);
    } catch (error) {
      this.logger.warn(`Failed to cleanup file: ${filePath}`, error.message);
    }
  }

  // Method to retry failed OCR processing
  async retryOcrProcessing(fileId: string, userId: string): Promise<OcrStatusDto> {
    this.logger.log(`Retrying OCR processing for file: ${fileId}`);
    
    const file = await this.prisma.uploadedFile.findUnique({
      where: { id: fileId },
    });
    
    if (!file) {
      throw new NotFoundException(`File not found: ${fileId}`);
    }
    
    if (file.userId !== userId) {
      throw new NotFoundException(`File not found: ${fileId}`);
    }
    
    return this.processImage(fileId, file.filePath, userId, file.originalName);
  }
}