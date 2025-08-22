import React from 'react';
import { Book } from '@/types/book';
import { BookCard } from './BookCard';
import { LoadingSpinner } from './LoadingSpinner';

interface BookListProps {
  books: Book[];
  loading: boolean;
  onViewBook: (book: Book) => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
}

export const BookList: React.FC<BookListProps> = ({
  books,
  loading,
  onViewBook,
  onEditBook,
  onDeleteBook,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading books...</span>
      </div>
    );
  }

  if (books.length === 0) {
    return null; // Empty state is handled by parent component
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onViewBook={onViewBook}
          onEditBook={onEditBook}
          onDeleteBook={onDeleteBook}
        />
      ))}
    </div>
  );
};
