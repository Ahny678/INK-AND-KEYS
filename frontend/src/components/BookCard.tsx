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
          className="flex-1 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Book
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEditBook(book)}
          className="flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDeleteBook(book)}
          className="text-red-600 hover:text-red-700 hover:border-red-300 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </Button>
      </div>
    </div>
  );
};
