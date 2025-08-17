import { api } from './api';

export interface FileUploadResponse {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  createdAt: string;
}

export interface OCRProcessResponse {
  message: string;
  jobId: string;
}

export interface OCRStatusResponse {
  id: string;
  status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  progress?: number;
  message?: string;
  documentId?: string;
  createdAt: string;
}

class FileService {
  async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<FileUploadResponse>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  async processOCR(fileId: string, filePath: string, originalFileName: string): Promise<OCRProcessResponse> {
    const response = await api.post<OCRProcessResponse>('/ocr/process', {
      fileId,
      filePath,
      originalFileName,
    });

    return response.data;
  }

  async getOCRStatus(fileId: string): Promise<OCRStatusResponse> {
    const response = await api.get<OCRStatusResponse>(`/ocr/status/${fileId}`);
    return response.data;
  }

  async retryOCR(fileId: string): Promise<OCRProcessResponse> {
    const response = await api.post<OCRProcessResponse>(`/ocr/retry/${fileId}`);
    return response.data;
  }

  async getUserFiles(): Promise<FileUploadResponse[]> {
    const response = await api.get<FileUploadResponse[]>('/files');
    return response.data;
  }

  async deleteFile(fileId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/files/${fileId}`);
    return response.data;
  }

  validateFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
      };
    }

    return { isValid: true };
  }
}

export const fileService = new FileService();