import { FileStatus } from '@prisma/client';

export class FileUploadResponseDto {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  status: FileStatus;
  createdAt: Date;
}