import { api } from './api';
import { Book, CreateBookRequest, UpdateBookRequest } from '@/types/book';

export const bookService = {
  // Get all books for the current user
  async getBooks(): Promise<Book[]> {
    const response = await api.get<Book[]>('/books');
    return response.data;
  },

  // Create a new book
  async createBook(data: CreateBookRequest): Promise<Book> {
    const response = await api.post<Book>('/books', data);
    return response.data;
  },

  // Get a specific book
  async getBook(id: string): Promise<Book> {
    const response = await api.get<Book>(`/books/${id}`);
    return response.data;
  },

  // Update a book
  async updateBook(id: string, data: UpdateBookRequest): Promise<Book> {
    const response = await api.patch<Book>(`/books/${id}`, data);
    return response.data;
  },

  // Delete a book
  async deleteBook(id: string): Promise<void> {
    await api.delete(`/books/${id}`);
  },
};
