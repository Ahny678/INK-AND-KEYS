import { api } from './api';
import { Document, CreateDocumentRequest, UpdateDocumentRequest } from '@/types/document';

export const documentService = {
  // Get all documents for the current user
  async getDocuments(): Promise<Document[]> {
    const response = await api.get<Document[]>('/documents');
    return response.data;
  },

  // Create a new document
  async createDocument(data: CreateDocumentRequest): Promise<Document> {
    const response = await api.post<Document>('/documents', data);
    return response.data;
  },

  // Get a specific document
  async getDocument(id: string): Promise<Document> {
    const response = await api.get<Document>(`/documents/${id}`);
    return response.data;
  },

  // Update a document
  async updateDocument(id: string, data: UpdateDocumentRequest): Promise<Document> {
    const response = await api.patch<Document>(`/documents/${id}`, data);
    return response.data;
  },

  // Delete a document
  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};