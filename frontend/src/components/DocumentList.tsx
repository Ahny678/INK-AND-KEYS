import React from 'react';
import { Document } from '@/types/document';
import { DocumentCard } from './DocumentCard';
import { LoadingSpinner } from './LoadingSpinner';

interface DocumentListProps {
  documents: Document[];
  loading: boolean;
  onEditDocument: (document: Document) => void;
  onDeleteDocument: (document: Document) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading,
  onEditDocument,
  onDeleteDocument,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading documents...</span>
      </div>
    );
  }

  if (documents.length === 0) {
    return null; // Empty state is handled by parent component
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          onEdit={onEditDocument}
          onDelete={onDeleteDocument}
        />
      ))}
    </div>
  );
};