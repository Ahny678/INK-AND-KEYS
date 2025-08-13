import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(DocumentType)
  @IsOptional()
  documentType?: DocumentType;

  @IsString()
  @IsOptional()
  originalFileName?: string;
}