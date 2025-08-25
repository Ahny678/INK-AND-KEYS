import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Button, 
  BookList, 
  EmptyState, 
  DeleteConfirmationModal,
  CreateBookModal,
  EditBookModal
} from '@/components';
import { bookService } from '@/services';
import { Book } from '@/types/book';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createBookModal, setCreateBookModal] = useState(false);
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    book: Book | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    book: null,
    isDeleting: false,
  });

  const [editBookModal, setEditBookModal] = useState<{
    isOpen: boolean;
    book: Book | null;
    isUpdating: boolean;
  }>({
    isOpen: false,
    book: null,
    isUpdating: false,
  });

  // Load books on component mount
  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedBooks = await bookService.getBooks();
      setBooks(fetchedBooks);
    } catch (err) {
      console.error('Failed to load books:', err);
      setError('Failed to load books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async (data: { title: string; description?: string }) => {
    try {
      setIsCreatingBook(true);
      const newBook = await bookService.createBook(data);
      setBooks(prev => [newBook, ...prev]);
      setCreateBookModal(false);
    } catch (err) {
      console.error('Failed to create book:', err);
      setError('Failed to create book. Please try again.');
    } finally {
      setIsCreatingBook(false);
    }
  };

  const handleViewBook = (book: Book) => {
    navigate(`/books/${book.id}`);
  };

  const handleEditBook = (book: Book) => {
    setEditBookModal({
      isOpen: true,
      book,
      isUpdating: false,
    });
  };

  const handleUpdateBook = async (data: { title: string; description?: string }) => {
    if (!editBookModal.book) return;

    try {
      setEditBookModal(prev => ({ ...prev, isUpdating: true }));
      const updatedBook = await bookService.updateBook(editBookModal.book.id, data);
      
      // Update book in local state
      setBooks(prev => 
        prev.map(book => 
          book.id === editBookModal.book!.id ? updatedBook : book
        )
      );
      
      // Close modal
      setEditBookModal({
        isOpen: false,
        book: null,
        isUpdating: false,
      });
    } catch (err) {
      console.error('Failed to update book:', err);
      setError('Failed to update book. Please try again.');
      setEditBookModal(prev => ({ ...prev, isUpdating: false }));
    }
  };

  const handleDeleteBook = (book: Book) => {
    setDeleteModal({
      isOpen: true,
      book,
      isDeleting: false,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.book) return;

    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      await bookService.deleteBook(deleteModal.book.id);
      
      // Remove book from local state
      setBooks(prev => 
        prev.filter(book => book.id !== deleteModal.book!.id)
      );
      
      // Close modal
      setDeleteModal({
        isOpen: false,
        book: null,
        isDeleting: false,
      });
    } catch (err) {
      console.error('Failed to delete book:', err);
      setError('Failed to delete book. Please try again.');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const cancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      book: null,
      isDeleting: false,
    });
  };

  const closeEditModal = () => {
    setEditBookModal({
      isOpen: false,
      book: null,
      isUpdating: false,
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Books</h1>
              <p className="text-gray-600 mt-2">Manage your book collection and start writing</p>
            </div>
            
            {/* Action buttons - only show when not loading and has books */}
            {!loading && books.length > 0 && (
              <div className="flex gap-3">
                <Button
                  onClick={() => setCreateBookModal(true)}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Book
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={loadBooks}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {!loading && books.length === 0 && !error ? (
            <EmptyState
              onCreateDocument={() => setCreateBookModal(true)}
              onUploadFile={() => {}} // We'll handle this differently for books
            />
          ) : (
            <div className="p-6">
              <BookList
                books={books}
                loading={loading}
                onViewBook={handleViewBook}
                onEditBook={handleEditBook}
                onDeleteBook={handleDeleteBook}
              />
            </div>
          )}
        </div>

        {/* Create Book Modal */}
        <CreateBookModal
          isOpen={createBookModal}
          onClose={() => setCreateBookModal(false)}
          onSubmit={handleCreateBook}
          isCreating={isCreatingBook}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          documentTitle={deleteModal.book?.title || ''}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDeleting={deleteModal.isDeleting}
        />

        {/* Edit Book Modal */}
        <EditBookModal
          isOpen={editBookModal.isOpen}
          onClose={closeEditModal}
          onSubmit={handleUpdateBook}
          isUpdating={editBookModal.isUpdating}
          book={editBookModal.book}
        />
      </div>
    </Layout>
  );
};