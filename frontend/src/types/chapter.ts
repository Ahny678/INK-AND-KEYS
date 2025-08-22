export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  bookId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChapterRequest {
  title: string;
  content?: string;
  order?: number;
}

export interface UpdateChapterRequest {
  title?: string;
  content?: string;
  order?: number;
}

export interface ReorderChaptersRequest {
  chapterIds: string[];
}
