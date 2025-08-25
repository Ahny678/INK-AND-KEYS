export class ChapterResponseDto {
  id: string;
  title: string;
  content: string;
  order: number;
  coverImageUrl?: string;
  coverImagePublicId?: string;
  bookId: string;
  createdAt: Date;
  updatedAt: Date;
}
