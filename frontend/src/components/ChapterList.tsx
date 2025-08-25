import React, { useState, useCallback } from 'react';
import { Chapter } from '@/types/chapter';
import { ChapterCard } from './ChapterCard';
import { LoadingSpinner } from './LoadingSpinner';
import { Button } from './Button';

interface ChapterListProps {
  chapters: Chapter[];
  loading: boolean;
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapter: Chapter) => void;
  onReorderChapters?: (chapterIds: string[]) => void;
  isReordering?: boolean;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  loading,
  onEditChapter,
  onDeleteChapter,
  onReorderChapters,
  isReordering = false,
}) => {
  const [draggedChapter, setDraggedChapter] = useState<string | null>(null);
  const [dragOverChapter, setDragOverChapter] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, chapterId: string) => {
    setDraggedChapter(chapterId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, chapterId: string) => {
    e.preventDefault();
    if (draggedChapter && draggedChapter !== chapterId) {
      setDragOverChapter(chapterId);
    }
  }, [draggedChapter]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverChapter(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetChapterId: string) => {
    e.preventDefault();
    setDragOverChapter(null);
    setDraggedChapter(null);

    if (!draggedChapter || !onReorderChapters || draggedChapter === targetChapterId) {
      return;
    }

    // Create new order array
    const draggedIndex = chapters.findIndex(c => c.id === draggedChapter);
    const targetIndex = chapters.findIndex(c => c.id === targetChapterId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newChapters = [...chapters];
    const [draggedChapterData] = newChapters.splice(draggedIndex, 1);
    newChapters.splice(targetIndex, 0, draggedChapterData);

    // Update order numbers and call reorder function
    const reorderedChapters = newChapters.map((chapter, index) => ({
      ...chapter,
      order: index + 1
    }));

    const chapterIds = reorderedChapters.map(c => c.id);
    onReorderChapters(chapterIds);
  }, [draggedChapter, onReorderChapters, chapters]);

  const handleDragEnd = useCallback(() => {
    setDraggedChapter(null);
    setDragOverChapter(null);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading chapters...</span>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No chapters yet</h3>
        <p className="text-gray-500">Start writing your book by adding the first chapter.</p>
      </div>
    );
  }

  // Sort chapters by order to ensure proper numbering
  const sortedChapters = [...chapters].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sortedChapters.map((chapter, index) => (
        <div
          key={chapter.id}
          draggable={!!onReorderChapters && !isReordering}
          onDragStart={(e) => handleDragStart(e, chapter.id)}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, chapter.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, chapter.id)}
          onDragEnd={handleDragEnd}
          className={`transition-all duration-200 ${
            draggedChapter === chapter.id ? 'opacity-50' : ''
          } ${
            dragOverChapter === chapter.id ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
          }`}
        >
          <ChapterCard
            chapter={{
              ...chapter,
              order: index + 1 // Ensure proper sequential numbering
            }}
            onEditChapter={onEditChapter}
            onDeleteChapter={onDeleteChapter}
            isDragging={draggedChapter === chapter.id}
            isDragOver={dragOverChapter === chapter.id}
          />
        </div>
      ))}
      
      {onReorderChapters && chapters.length > 1 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <svg className="inline w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Drag and drop chapters to reorder them
            </div>
            {isReordering && (
              <div className="text-sm text-blue-600">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Updating order...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
