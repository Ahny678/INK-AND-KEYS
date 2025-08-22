export class BookResponseDto {
  id: string;
  title: string;
  description?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    chapters: number;
  };
}
