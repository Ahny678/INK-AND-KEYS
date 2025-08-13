import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { FilesService } from './files.service';
import { FileUploadResponseDto } from './dto';
import { multerConfig } from './config/multer.config';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<FileUploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const uploadedFile = await this.filesService.uploadFile(file, user.id);

    return {
      id: uploadedFile.id,
      originalName: uploadedFile.originalName,
      fileName: uploadedFile.fileName,
      mimeType: uploadedFile.mimeType,
      size: uploadedFile.size,
      status: uploadedFile.status,
      createdAt: uploadedFile.createdAt,
    };
  }

  @Get()
  async getUserFiles(@CurrentUser() user: User): Promise<FileUploadResponseDto[]> {
    const files = await this.filesService.getUserFiles(user.id);
    
    return files.map(file => ({
      id: file.id,
      originalName: file.originalName,
      fileName: file.fileName,
      mimeType: file.mimeType,
      size: file.size,
      status: file.status,
      createdAt: file.createdAt,
    }));
  }

  @Get(':id')
  async getFile(
    @Param('id') fileId: string,
    @CurrentUser() user: User,
  ): Promise<FileUploadResponseDto> {
    const file = await this.filesService.getFile(fileId, user.id);
    
    if (!file) {
      throw new NotFoundException('File not found');
    }

    return {
      id: file.id,
      originalName: file.originalName,
      fileName: file.fileName,
      mimeType: file.mimeType,
      size: file.size,
      status: file.status,
      createdAt: file.createdAt,
    };
  }

  @Delete(':id')
  async deleteFile(
    @Param('id') fileId: string,
    @CurrentUser() user: User,
  ): Promise<{ message: string }> {
    await this.filesService.deleteFile(fileId, user.id);
    return { message: 'File deleted successfully' };
  }
}