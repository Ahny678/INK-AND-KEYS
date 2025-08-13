import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadedFile, FileStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

@Injectable()
export class FilesService {
  private readonly uploadPath = 'uploads';
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf'
  ];
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(private prisma: PrismaService) { }

  private async ensureUploadDirectory(): Promise<void> {
    try {
      await mkdir(this.uploadPath, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
  }

  validateFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size too large. Maximum size: ${this.maxFileSize / (1024 * 1024)}MB`
      );
    }
  }

  async uploadFile(file: Express.Multer.File, userId: string): Promise<UploadedFile> {
    this.validateFile(file);

    try {
      // Ensure upload directory exists
      await this.ensureUploadDirectory();

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const fileName = `${timestamp}_${randomString}${fileExtension}`;
      const filePath = path.join(this.uploadPath, fileName);

      // Save file to disk
      await writeFile(filePath, file.buffer);

      // Save file metadata to database
      const uploadedFile = await this.prisma.uploadedFile.create({
        data: {
          originalName: file.originalname,
          fileName,
          filePath,
          mimeType: file.mimetype,
          size: file.size,
          userId,
          status: FileStatus.UPLOADED,
        },
      });

      return uploadedFile;
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  async getFile(fileId: string, userId: string): Promise<UploadedFile | null> {
    return this.prisma.uploadedFile.findFirst({
      where: {
        id: fileId,
        userId,
      },
    });
  }

  async getUserFiles(userId: string): Promise<UploadedFile[]> {
    return this.prisma.uploadedFile.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.getFile(fileId, userId);

    if (!file) {
      throw new BadRequestException('File not found');
    }

    try {
      // Delete file from disk
      await unlink(file.filePath);
    } catch (error) {
      // File might not exist on disk, continue with database deletion
    }

    // Delete file record from database
    await this.prisma.uploadedFile.delete({
      where: {
        id: fileId,
      },
    });
  }

  async updateFileStatus(fileId: string, status: FileStatus): Promise<UploadedFile> {
    const updatedFile = await this.prisma.uploadedFile.update({
      where: {
        id: fileId,
      },
      data: {
        status,
      },
    });

    // Clean up file after successful processing
    if (status === FileStatus.PROCESSED) {
      try {
        await unlink(updatedFile.filePath);
      } catch (error) {
        // File might already be deleted, continue
      }
    }

    return updatedFile;
  }

  async cleanupProcessedFiles(): Promise<void> {
    // Clean up files that have been processed for more than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const processedFiles = await this.prisma.uploadedFile.findMany({
      where: {
        status: FileStatus.PROCESSED,
        createdAt: {
          lt: oneHourAgo,
        },
      },
    });

    for (const file of processedFiles) {
      try {
        await unlink(file.filePath);
        await this.prisma.uploadedFile.delete({
          where: { id: file.id },
        });
      } catch (error) {
        // Continue with other files if one fails
      }
    }
  }
}