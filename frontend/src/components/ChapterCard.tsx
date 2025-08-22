import React from 'react';
import { Chapter } from '@/types/chapter';
import { Button } from './Button';

interface ChapterCardProps {
  chapter: Chapter;
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapter: Chapter) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  onEditChapter,
  onDeleteChapter,
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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 border border-gray-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
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
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteChapter(chapter)}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
