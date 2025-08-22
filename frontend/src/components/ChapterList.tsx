import React from 'react';
import { Chapter } from '@/types/chapter';
import { ChapterCard } from './ChapterCard';
import { LoadingSpinner } from './LoadingSpinner';

interface ChapterListProps {
  chapters: Chapter[];
  loading: boolean;
  onEditChapter: (chapter: Chapter) => void;
  onDeleteChapter: (chapter: Chapter) => void;
}

export const ChapterList: React.FC<ChapterListProps> = ({
  chapters,
  loading,
  onEditChapter,
  onDeleteChapter,
}) => {
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

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => (
        <ChapterCard
          key={chapter.id}
          chapter={chapter}
          onEditChapter={onEditChapter}
          onDeleteChapter={onDeleteChapter}
        />
      ))}
    </div>
  );
};
