export interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  documentType: 'CREATED' | 'OCR_PROCESSED';
  originalFileName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  title: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
}