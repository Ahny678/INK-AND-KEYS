import { api } from './api';
import { Chapter, CreateChapterRequest, UpdateChapterRequest, ReorderChaptersRequest, GenerateChapterCoverRequest } from '@/types/chapter';

export const chapterService = {
  // Get all chapters for a specific book
  async getChaptersByBook(bookId: string): Promise<Chapter[]> {
    const response = await api.get<Chapter[]>(`/books/${bookId}/chapters`);
    return response.data;
  },

  // Create a new chapter in a book
  async createChapter(bookId: string, data: CreateChapterRequest): Promise<Chapter> {
    const response = await api.post<Chapter>(`/books/${bookId}/chapters`, data);
    return response.data;
  },

  // Get a specific chapter
  async getChapter(bookId: string, chapterId: string): Promise<Chapter> {
    const response = await api.get<Chapter>(`/books/${bookId}/chapters/${chapterId}`);
    return response.data;
  },

  // Update a chapter
  async updateChapter(bookId: string, chapterId: string, data: UpdateChapterRequest): Promise<Chapter> {
    const response = await api.patch<Chapter>(`/books/${bookId}/chapters/${chapterId}`, data);
    return response.data;
  },

  // Delete a chapter
  async deleteChapter(bookId: string, chapterId: string): Promise<void> {
    await api.delete(`/books/${bookId}/chapters/${chapterId}`);
  },

  // Reorder chapters in a book
  async reorderChapters(bookId: string, data: ReorderChaptersRequest): Promise<Chapter[]> {
    const response = await api.put<Chapter[]>(`/books/${bookId}/chapters/reorder`, data);
    return response.data;
  },

  // Generate cover image for a chapter
  async generateChapterCover(chapterId: string, data: GenerateChapterCoverRequest): Promise<Chapter> {
    const response = await api.post<Chapter>(`/chapters/${chapterId}/cover`, data);
    return response.data;
  },

  // Upload cover image for a chapter
  async uploadChapterCover(chapterId: string, file: File): Promise<Chapter> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<Chapter>(`/chapters/${chapterId}/cover/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
