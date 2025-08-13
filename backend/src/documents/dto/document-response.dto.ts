import { DocumentType } from '@prisma/client';

export class DocumentResponseDto {
  id: string;
  title: string;
  content: string;
  userId: string;
  documentType: DocumentType;
  originalFileName?: string;
  createdAt: Date;
  updatedAt: Date;
}