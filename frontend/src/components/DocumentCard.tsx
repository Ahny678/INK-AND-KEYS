import React from 'react';
import { Document } from '@/types/document';
import { Button } from './Button';

interface DocumentCardProps {
  document: Document;
  onEdit: (document: Document) => void;
  onDelete: (document: Document) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onEdit,
  onDelete,
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

  const getDocumentTypeLabel = (type: string) => {
    return type === 'OCR_PROCESSED' ? 'OCR Document' : 'Created Document';
  };

  const getDocumentTypeColor = (type: string) => {
    return type === 'OCR_PROCESSED' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {document.title}
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDocumentTypeColor(document.documentType)}`}>
              {getDocumentTypeLabel(document.documentType)}
            </span>
            {document.originalFileName && (
              <span className="text-xs text-gray-500">
                from {document.originalFileName}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600 text-sm line-clamp-3">
          {document.content ? 
            document.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 
            'No content yet'
          }
        </p>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          <p>Created: {formatDate(document.createdAt)}</p>
          {document.updatedAt !== document.createdAt && (
            <p>Updated: {formatDate(document.updatedAt)}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(document)}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(document)}
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};