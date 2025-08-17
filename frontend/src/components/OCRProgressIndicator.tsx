import React from 'react';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';

export type OCRStatus = 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

interface OCRProgressIndicatorProps {
  status: OCRStatus;
  progress?: number;
  message?: string;
  documentId?: string;
  onRetry?: () => void;
  onViewDocument?: (documentId: string) => void;
  className?: string;
}

export const OCRProgressIndicator: React.FC<OCRProgressIndicatorProps> = ({
  status,
  progress,
  message,
  documentId,
  onRetry,
  onViewDocument,
  className = '',
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'UPLOADED':
        return (
          <div className="w-6 h-6 text-blue-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'PROCESSING':
        return <LoadingSpinner size="sm" />;
      case 'PROCESSED':
        return (
          <div className="w-6 h-6 text-green-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'FAILED':
        return (
          <div className="w-6 h-6 text-red-500">
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'UPLOADED':
        return 'File uploaded successfully';
      case 'PROCESSING':
        return 'Processing with OCR...';
      case 'PROCESSED':
        return 'OCR processing completed';
      case 'FAILED':
        return 'OCR processing failed';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'UPLOADED':
        return 'text-blue-600';
      case 'PROCESSING':
        return 'text-blue-600';
      case 'PROCESSED':
        return 'text-green-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBgColor = () => {
    switch (status) {
      case 'UPLOADED':
        return 'bg-blue-50 border-blue-200';
      case 'PROCESSING':
        return 'bg-blue-50 border-blue-200';
      case 'PROCESSED':
        return 'bg-green-50 border-green-200';
      case 'FAILED':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getBgColor()} ${className}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <p className={`text-sm font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </p>
          {message && (
            <p className="text-xs text-gray-600 mt-1">{message}</p>
          )}
          {status === 'PROCESSING' && progress !== undefined && (
            <div className="mt-2">
              <div className="bg-white rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">{progress}% complete</p>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {status === 'FAILED' && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Retry
            </Button>
          )}
          
          {status === 'PROCESSED' && documentId && onViewDocument && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onViewDocument(documentId)}
            >
              View Document
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};