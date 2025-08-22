import React from 'react';
import { Book } from '@/types/book';
import { Button } from './Button';

interface BookCardProps {
  book: Book;
  onViewBook: (book: Book) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onViewBook,
  onEditBook,
  onDeleteBook,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getChapterCountText = (count: number) => {
    if (count === 0) return 'No chapters yet';
    if (count === 1) return '1 chapter';
    return `${count} chapters`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {book.title}
          </h3>
          {book.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {book.description}
            </p>
          )}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getChapterCountText(book._count?.chapters || 0)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-xs text-gray-500">
          <p>Created: {formatDate(book.createdAt)}</p>
          {book.updatedAt !== book.createdAt && (
            <p>Updated: {formatDate(book.updatedAt)}</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button
          onClick={() => onViewBook(book)}
          className="flex-1"
        >
          View Book
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditBook(book)}
        >
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDeleteBook(book)}
          className="text-red-600 hover:text-red-700 hover:border-red-300"
        >
          Delete
        </Button>
      </div>
    </div>
  );
};
