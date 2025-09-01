import React, { useState, useRef, useCallback } from 'react';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { fileService, OCRStatusResponse } from '@/services/fileService';
import { documentService } from '@/services/documentService';

interface CreateChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; content?: string }) => void;
  isCreating: boolean;
}

type ContentMode = 'manual' | 'upload';

export const CreateChapterModal: React.FC<CreateChapterModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentMode, setContentMode] = useState<ContentMode>('manual');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [, setOcrStatus] = useState<OCRStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    return fileService.validateFile(file);
  };

  const handleFileSelect = (file: File) => {
    const validation = validateFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }
    
    setError(null);
    setUploadedFile(file);
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadMessage('');
    setOcrStatus(null);
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) return;

    try {
      setUploadStatus('uploading');
      setUploadMessage('Uploading file...');
      setError(null);

      // Upload file
      const uploadResponse = await fileService.uploadFile(uploadedFile);
      console.log('File upload response:', uploadResponse);
      setUploadProgress(25);
      setUploadMessage('File uploaded, starting OCR processing...');

      // Start OCR processing
      await fileService.processOCR(
        uploadResponse.id,
        uploadResponse.filePath,
        uploadResponse.originalName
      );
      
      setUploadStatus('processing');
      setUploadProgress(50);
      setUploadMessage('Processing text extraction...');

      // Start polling for OCR status
      startOcrStatusPolling(uploadResponse.id);

    } catch (err) {
      console.error('File upload failed:', err);
      setError(`Failed to upload file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setUploadStatus('error');
    }
  };

  const startOcrStatusPolling = (fileId: string) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const status = await fileService.getOCRStatus(fileId);
        console.log('OCR status:', status);
        setOcrStatus(status);
        setUploadProgress(50 + (status.progress || 0) * 0.5);
        setUploadMessage(status.message || 'Processing...');

        if (status.status === 'PROCESSED' && status.documentId) {
          // OCR completed successfully
          setUploadStatus('completed');
          setUploadProgress(100);
          setUploadMessage('Text extraction completed!');
          
          // Fetch the document content
          const document = await documentService.getDocument(status.documentId);
          setContent(document.content);
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else if (status.status === 'FAILED') {
          setError(`Text extraction failed: ${status.message || 'Unknown error'}`);
          setUploadStatus('error');
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } catch (err) {
        console.error('Failed to get OCR status:', err);
        setError(`Failed to check processing status: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setUploadStatus('error');
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    }, 2000); // Poll every 2 seconds
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      title: title.trim(),
      content: content.trim() || undefined,
    });
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setContentMode('manual');
    setUploadedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadMessage('');
    setOcrStatus(null);
    setError(null);
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      resetForm();
      onClose();
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add New Chapter</h3>
            <button
              onClick={handleClose}
              disabled={isCreating}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="chapter-title" className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Title <span className="text-red-500">*</span>
              </label>
              <input
                id="chapter-title"
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter chapter title..."
                required
                disabled={isCreating}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content (Optional)
              </label>
              
              {/* Content Mode Toggle */}
              <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setContentMode('manual')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    contentMode === 'manual'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  disabled={isCreating}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Type Manually
                </button>
                <button
                  type="button"
                  onClick={() => setContentMode('upload')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    contentMode === 'upload'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  disabled={isCreating}
                >
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload File
                </button>
              </div>

              {/* Manual Content Input */}
              {contentMode === 'manual' && (
                <textarea
                  id="chapter-content"
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your chapter..."
                  disabled={isCreating}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                />
              )}

              {/* File Upload Interface */}
              {contentMode === 'upload' && (
                <div className="space-y-4">
                  {/* File Upload Area */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      uploadedFile
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {uploadedFile ? (
                      <div className="space-y-2">
                        <svg className="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium text-green-700">{uploadedFile.name}</p>
                        <p className="text-xs text-green-600">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => setUploadedFile(null)}
                          className="text-xs text-red-600 hover:text-red-800"
                          disabled={isCreating || uploadStatus === 'uploading' || uploadStatus === 'processing'}
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-sm text-gray-600">
                          Drag and drop a file here, or{' '}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                            disabled={isCreating}
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-gray-500">
                          Supports PDF, JPG, PNG (max 10MB)
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                    className="hidden"
                    disabled={isCreating}
                  />

                  {/* Upload Button */}
                  {uploadedFile && uploadStatus === 'idle' && (
                    <Button
                      type="button"
                      onClick={handleFileUpload}
                      disabled={isCreating}
                      className="w-full"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload & Extract Text
                    </Button>
                  )}

                  {/* Upload Progress */}
                  {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{uploadMessage}</span>
                        <span className="text-gray-500">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      {uploadStatus === 'processing' && (
                        <div className="flex items-center text-sm text-gray-600">
                          <LoadingSpinner size="sm" />
                          <span className="ml-2">Extracting text from your file...</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Success Message */}
                  {uploadStatus === 'completed' && (
                    <div className="flex items-center text-sm text-green-600 bg-green-50 p-3 rounded-md">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Text extracted successfully! You can edit it below or create the chapter.
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                      </div>
                      {uploadStatus === 'error' && uploadedFile && (
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={handleFileUpload}
                            disabled={isCreating}
                            className="flex-1"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Try Again
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setUploadedFile(null);
                              setError(null);
                              setUploadStatus('idle');
                              setUploadProgress(0);
                              setUploadMessage('');
                            }}
                            disabled={isCreating}
                            className="flex-1"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Extracted Content Preview */}
                  {content && uploadStatus === 'completed' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Extracted Content (You can edit this)
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Extracted text will appear here..."
                        disabled={isCreating}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isCreating}
                className="flex-1 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || isCreating || uploadStatus === 'uploading' || uploadStatus === 'processing'}
                className="flex-1 flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Add Chapter
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
