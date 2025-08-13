export interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  userId: string;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  createdAt: string;
}

export interface FileUploadResponse {
  file: UploadedFile;
  message: string;
}

export interface OCRStatus {
  fileId: string;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  documentId?: string;
  error?: string;
}