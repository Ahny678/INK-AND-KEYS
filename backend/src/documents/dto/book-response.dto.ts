export class BookResponseDto {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  coverImagePublicId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    chapters: number;
  };
}
