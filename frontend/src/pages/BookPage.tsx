import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Button, 
  ChapterList, 
  LoadingSpinner,
  CreateChapterModal,
  DeleteConfirmationModal
} from '@/components';
import { bookService, chapterService } from '@/services';
import { Book, Chapter } from '@/types';

export const BookPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createChapterModal, setCreateChapterModal] = useState(false);
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    chapter: Chapter | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    chapter: null,
    isDeleting: false,
  });

  // Load book and chapters on component mount
  useEffect(() => {
    if (bookId) {
      loadBookAndChapters();
    }
  }, [bookId]);

  const loadBookAndChapters = async () => {
    if (!bookId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Load book and chapters in parallel
      const [bookData, chaptersData] = await Promise.all([
        bookService.getBook(bookId),
        chapterService.getChaptersByBook(bookId)
      ]);
      
      setBook(bookData);
      setChapters(chaptersData);
    } catch (err) {
      console.error('Failed to load book and chapters:', err);
      setError('Failed to load book and chapters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChapter = async (data: { title: string; content?: string }) => {
    if (!bookId) return;

    try {
      setIsCreatingChapter(true);
      const newChapter = await chapterService.createChapter(bookId, data);
      setChapters(prev => [...prev, newChapter]);
      setCreateChapterModal(false);
    } catch (err) {
      console.error('Failed to create chapter:', err);
      setError('Failed to create chapter. Please try again.');
    } finally {
      setIsCreatingChapter(false);
    }
  };

  const handleEditChapter = (chapter: Chapter) => {
    navigate(`/books/${bookId}/chapters/${chapter.id}/edit`);
  };

  const handleDeleteChapter = (chapter: Chapter) => {
    setDeleteModal({
      isOpen: true,
      chapter,
      isDeleting: false,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.chapter || !bookId) return;

    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      await chapterService.deleteChapter(bookId, deleteModal.chapter.id);
      
      // Remove chapter from local state
      setChapters(prev => 
        prev.filter(chapter => chapter.id !== deleteModal.chapter!.id)
      );
      
      // Close modal
      setDeleteModal({
        isOpen: false,
        chapter: null,
        isDeleting: false,
      });
    } catch (err) {
      console.error('Failed to delete chapter:', err);
      setError('Failed to delete chapter. Please try again.');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const cancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      chapter: null,
      isDeleting: false,
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">Loading book...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !book) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error || 'Book not found'}</div>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Book Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Books
                </Button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
              {book.description && (
                <p className="text-gray-600 mt-2 max-w-2xl">{book.description}</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span>Created: {new Date(book.createdAt).toLocaleDateString()}</span>
                {book.updatedAt !== book.createdAt && (
                  <span>Updated: {new Date(book.updatedAt).toLocaleDateString()}</span>
                )}
                <span>{chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setCreateChapterModal(true)}
                className="flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Chapter
              </Button>
            </div>
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
                  onClick={loadBookAndChapters}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chapters Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <ChapterList
              chapters={chapters}
              loading={loading}
              onEditChapter={handleEditChapter}
              onDeleteChapter={handleDeleteChapter}
            />
          </div>
        </div>

        {/* Create Chapter Modal */}
        <CreateChapterModal
          isOpen={createChapterModal}
          onClose={() => setCreateChapterModal(false)}
          onSubmit={handleCreateChapter}
          isCreating={isCreatingChapter}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          documentTitle={deleteModal.chapter?.title || ''}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDeleting={deleteModal.isDeleting}
        />
      </div>
    </Layout>
  );
};
