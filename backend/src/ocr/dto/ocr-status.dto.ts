export class OcrStatusDto {
  id: string;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  progress?: number;
  message?: string;
  documentId?: string;
  createdAt: Date;
}