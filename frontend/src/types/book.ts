export interface Book {
  id: string;
  title: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    chapters: number;
  };
}

export interface CreateBookRequest {
  title: string;
  description?: string;
}

export interface UpdateBookRequest {
  title?: string;
  description?: string;
}
