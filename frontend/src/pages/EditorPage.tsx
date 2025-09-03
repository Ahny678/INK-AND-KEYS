import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  RichTextEditor,
  Button,
  LoadingSpinner,
  CoverImageDisplay,
  CoverImageGenerator,
} from "@/components";
import { chapterService, bookService } from "@/services";
import { useAutosave } from "@/hooks/useAutosave";
import { Chapter, Book } from "@/types";

export const EditorPage: React.FC = () => {
  const { bookId, chapterId } = useParams<{
    bookId: string;
    chapterId: string;
  }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [showCoverGenerator, setShowCoverGenerator] = useState(false);
  const [coverGenerationPrompt, setCoverGenerationPrompt] = useState("");

  // Autosave hook for content
  const { saveStatus, triggerSave, updateContent } = useAutosave({
    onSave: useCallback(
      async (newContent: string) => {
        if (!chapter || !bookId) return;

        await chapterService.updateChapter(bookId, chapter.id, {
          content: newContent,
          title: title,
        });
      },
      [chapter, bookId, title]
    ),
    delay: 2000,
    enabled: !!chapter && !!bookId,
  });

  // Load book and chapter on mount
  useEffect(() => {
    const loadBookAndChapter = async () => {
      if (!bookId) {
        setError("Book ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const bookData = await bookService.getBook(bookId);
        setBook(bookData);

        if (!chapterId || chapterId === "new") {
          // New chapter - create it first
          try {
            const newChapter = await chapterService.createChapter(bookId, {
              title: "Untitled Chapter",
            });
            setChapter(newChapter);
            setTitle(newChapter.title);
            setContent(newChapter.content || "");
            navigate(`/books/${bookId}/chapters/${newChapter.id}/edit`, {
              replace: true,
            });
          } catch (err) {
            setError("Failed to create new chapter");
            console.error("Error creating chapter:", err);
          }
        } else {
          // Load existing chapter
          try {
            const chapterData = await chapterService.getChapter(
              bookId,
              chapterId
            );
            setChapter(chapterData);
            setTitle(chapterData.title);
            setContent(chapterData.content || "");
          } catch (err) {
            setError("Failed to load chapter");
            console.error("Error loading chapter:", err);
          }
        }
      } catch (err) {
        setError("Failed to load book");
        console.error("Error loading book:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBookAndChapter();
  }, [bookId, chapterId, navigate]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      updateContent(newContent);
    },
    [updateContent]
  );

  const handleTitleSave = useCallback(async () => {
    if (!chapter || !bookId || !title.trim()) return;

    try {
      await chapterService.updateChapter(bookId, chapter.id, {
        title: title.trim(),
      });
      setChapter((prev) => (prev ? { ...prev, title: title.trim() } : null));
      setIsTitleEditing(false);
    } catch (err) {
      console.error("Error saving title:", err);
      setError("Failed to save title");
    }
  }, [chapter, bookId, title]);

  const handleTitleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleTitleSave();
      } else if (e.key === "Escape") {
        setTitle(chapter?.title || "");
        setIsTitleEditing(false);
      }
    },
    [handleTitleSave, chapter]
  );

  const handleTextSelectionForCover = useCallback((selectedText: string) => {
    setCoverGenerationPrompt(selectedText);
    setShowCoverGenerator(true);
  }, []);

  const handleGenerateChapterCover = useCallback(
    async (prompt: string) => {
      if (!chapter) return;

      try {
        const updatedChapter = await chapterService.generateChapterCover(
          chapter.id,
          { prompt }
        );
        setChapter(updatedChapter);
      } catch (err) {
        console.error("Error generating chapter cover:", err);
        throw new Error("Failed to generate cover image. Please try again.");
      }
    },
    [chapter]
  );

  const handleUploadChapterCover = useCallback(
    async (file: File) => {
      if (!chapter) return;

      try {
        const updatedChapter = await chapterService.uploadChapterCover(
          chapter.id,
          file
        );
        setChapter(updatedChapter);
      } catch (err) {
        console.error("Error uploading chapter cover:", err);
        throw new Error("Failed to upload cover image. Please try again.");
      }
    },
    [chapter]
  );

  const handleCloseCoverGenerator = useCallback(() => {
    setShowCoverGenerator(false);
    setCoverGenerationPrompt("");
  }, []);

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
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/books/${bookId}`)}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Book
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowCoverGenerator(true)}
                  className="flex items-center gap-2"
                  title="Generate chapter cover"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Generate Cover
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

            {/* Chapter Cover Image */}
            <div className="ml-6">
              <CoverImageDisplay
                imageUrl={chapter.coverImageUrl}
                alt={`Cover for ${title}`}
                size="medium"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowCoverGenerator(true)}
              />
            </div>
          </div>

          {/* Chapter metadata */}
          <div className="text-sm text-gray-500 flex items-center space-x-4">
            <span>Chapter {chapter.order}</span>
            <span>
              Created: {new Date(chapter.createdAt).toLocaleDateString()}
            </span>
            <span>
              Updated: {new Date(chapter.updatedAt).toLocaleDateString()}
            </span>
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
            onTextSelectionForCover={handleTextSelectionForCover}
          />
        </div>

        {/* Cover Generation Modal */}
        <CoverImageGenerator
          isOpen={showCoverGenerator}
          onClose={handleCloseCoverGenerator}
          onGenerate={handleGenerateChapterCover}
          onUpload={handleUploadChapterCover}
          initialPrompt={coverGenerationPrompt}
          title="Generate Chapter Cover"
          type="chapter"
        />
      </div>
    </Layout>
  );
};
