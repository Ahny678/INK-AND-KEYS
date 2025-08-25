import React from 'react';
import { Chapter } from '@/types/chapter';
import { Button } from './Button';

interface ChapterCardProps {
  chapter: Chapter;
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapter: Chapter) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  onEditChapter,
  onDeleteChapter,
  isDragging = false,
  isDragOver = false,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getContentPreview = (content: string) => {
    if (!content) return 'No content yet';
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 p-4 border border-gray-200 ${
      isDragging ? 'opacity-50 scale-95' : ''
    } ${
      isDragOver ? 'border-l-4 border-l-blue-500 bg-blue-50' : ''
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
              {chapter.order}
            </span>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {chapter.title}
            </h3>
          </div>
        </div>
      </div>
      
      <div className="mb-3">
        <p className="text-gray-600 text-sm line-clamp-2">
          {getContentPreview(chapter.content)}
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          <p>Created: {formatDate(chapter.createdAt)}</p>
          {chapter.updatedAt !== chapter.createdAt && (
            <p>Updated: {formatDate(chapter.updatedAt)}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditChapter(chapter)}
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
            onClick={() => onDeleteChapter(chapter)}
            className="text-red-600 hover:text-red-700 hover:border-red-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
