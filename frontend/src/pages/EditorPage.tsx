import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, RichTextEditor, Button, LoadingSpinner } from '@/components';
import { chapterService, bookService } from '@/services';
import { useAutosave } from '@/hooks/useAutosave';
import { Chapter, Book } from '@/types';

export const EditorPage: React.FC = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [currentChapterOrder, setCurrentChapterOrder] = useState<number>(0);

  // Autosave hook for content
  const { saveStatus, triggerSave, updateContent } = useAutosave({
    onSave: useCallback(async (newContent: string) => {
      if (!chapter || !bookId) return;
      
      await chapterService.updateChapter(bookId, chapter.id, {
        content: newContent,
        title: title,
      });
    }, [chapter, bookId, title]),
    delay: 2000, // 2 seconds
    enabled: !!chapter && !!bookId,
  });

  // Load book and chapter on mount
  useEffect(() => {
    const loadBookAndChapter = async () => {
      if (!bookId) {
        setError('Book ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Load book first
        const bookData = await bookService.getBook(bookId);
        setBook(bookData);

        if (!chapterId) {
          // New chapter - create it first
          try {
            const newChapter = await chapterService.createChapter(bookId, {
              title: 'Untitled Chapter',
            });
            setChapter(newChapter);
            setTitle(newChapter.title);
            setContent(newChapter.content || '');
            // Replace URL with the new chapter ID
            navigate(`/books/${bookId}/chapters/${newChapter.id}/edit`, { replace: true });
          } catch (err) {
            setError('Failed to create new chapter');
            console.error('Error creating chapter:', err);
          }
        } else {
          // Load existing chapter
          try {
            const chapterData = await chapterService.getChapter(bookId, chapterId);
            setChapter(chapterData);
            setTitle(chapterData.title);
            setContent(chapterData.content || '');
          } catch (err) {
            setError('Failed to load chapter');
            console.error('Error loading chapter:', err);
          }
        }
      } catch (err) {
        setError('Failed to load book');
        console.error('Error loading book:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBookAndChapter();
  }, [bookId, chapterId, navigate]);

  // Function to get current chapter order from book's chapters
  const getCurrentChapterOrder = useCallback(async () => {
    if (!bookId || !chapterId) return;

    try {
      const chapters = await chapterService.getChaptersByBook(bookId);
      const currentChapter = chapters.find(c => c.id === chapterId);
      if (currentChapter) {
        // Sort chapters by order and find the current chapter's position
        const sortedChapters = chapters.sort((a, b) => a.order - b.order);
        const orderIndex = sortedChapters.findIndex(c => c.id === chapterId);
        setCurrentChapterOrder(orderIndex + 1);
      }
    } catch (err) {
      console.error('Failed to get current chapter order:', err);
    }
  }, [bookId, chapterId]);

  // Update chapter order when component mounts or when chapter changes
  useEffect(() => {
    if (chapter) {
      getCurrentChapterOrder();
    }
  }, [chapter, getCurrentChapterOrder]);

  // Refresh chapter order when page becomes visible (e.g., after navigation back from BookPage)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && chapter) {
        getCurrentChapterOrder();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [chapter, getCurrentChapterOrder]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    updateContent(newContent);
  }, [updateContent]);

  const handleTitleSave = useCallback(async () => {
    if (!chapter || !bookId || !title.trim()) return;

    try {
      await chapterService.updateChapter(bookId, chapter.id, {
        title: title.trim(),
      });
      setChapter(prev => prev ? { ...prev, title: title.trim() } : null);
      setIsTitleEditing(false);
    } catch (err) {
      console.error('Error saving title:', err);
      setError('Failed to save title');
    }
  }, [chapter, bookId, title]);

  const handleTitleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle(chapter?.title || '');
      setIsTitleEditing(false);
    }
  }, [handleTitleSave, chapter]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={() => navigate(`/books/${bookId}`)}>
              Back to Book
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!book || !chapter) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            Book or chapter not found
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Chapter Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/books/${bookId}`)}
                  className="flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Book
                </Button>
                <Button
                  variant="outline"
                  onClick={getCurrentChapterOrder}
                  className="flex items-center gap-2"
                  title="Refresh chapter order"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Order
                </Button>
              </div>
              
              <div className="mb-2">
                <h2 className="text-lg font-medium text-gray-600">
                  {book.title}
                </h2>
              </div>
              
              {isTitleEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyPress}
                  className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => setIsTitleEditing(true)}
                  title="Click to edit title"
                >
                  {title}
                </h1>
              )}
            </div>
          </div>
          
          {/* Chapter metadata */}
          <div className="text-sm text-gray-500 flex items-center space-x-4">
            <span>Chapter {currentChapterOrder || chapter.order}</span>
            <span>Created: {new Date(chapter.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(chapter.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="bg-white rounded-lg shadow">
          <RichTextEditor
            content={content}
            onContentChange={handleContentChange}
            onSave={triggerSave}
            saveStatus={saveStatus}
            className="min-h-[600px]"
          />
        </div>
      </div>
    </Layout>
  );
};