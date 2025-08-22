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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Book
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
            <span>Chapter {chapter.order}</span>
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