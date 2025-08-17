import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileUploader } from '../components/FileUploader';
import { FilePreview } from '../components/FilePreview';
import { OCRProgressIndicator, OCRStatus } from '../components/OCRProgressIndicator';
import { Button } from '../components/Button';
import { fileService, FileUploadResponse, OCRStatusResponse } from '../services/fileService';

interface UploadState {
  selectedFile: File | null;
  uploadedFile: FileUploadResponse | null;
  ocrStatus: OCRStatusResponse | null;
  isUploading: boolean;
  isProcessing: boolean;
  error: string | null;
}

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<UploadState>({
    selectedFile: null,
    uploadedFile: null,
    ocrStatus: null,
    isUploading: false,
    isProcessing: false,
    error: null,
  });

  // Poll OCR status when processing
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (state.uploadedFile && state.isProcessing) {
      intervalId = setInterval(async () => {
        try {
          const status = await fileService.getOCRStatus(state.uploadedFile!.id);
          setState(prev => ({ ...prev, ocrStatus: status }));

          if (status.status === 'PROCESSED' || status.status === 'FAILED') {
            setState(prev => ({ ...prev, isProcessing: false }));
          }
        } catch (error) {
          console.error('Error polling OCR status:', error);
          setState(prev => ({ 
            ...prev, 
            isProcessing: false,
            error: 'Failed to check OCR status'
          }));
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.uploadedFile, state.isProcessing]);

  const handleFileSelect = async (file: File) => {
    setState(prev => ({
      ...prev,
      selectedFile: file,
      error: null,
      uploadedFile: null,
      ocrStatus: null,
    }));
  };

  const handleUpload = async () => {
    if (!state.selectedFile) return;
    
    setState(prev => ({ ...prev, isUploading: true, error: null }));

    try {
      // Upload file
      const uploadResponse = await fileService.uploadFile(state.selectedFile);
      setState(prev => ({ ...prev, uploadedFile: uploadResponse, isUploading: false }));

      // Start OCR processing
      setState(prev => ({ ...prev, isProcessing: true }));
      await fileService.processOCR(
        uploadResponse.id,
        uploadResponse.fileName,
        uploadResponse.originalName
      );

      // Initial status check
      const initialStatus = await fileService.getOCRStatus(uploadResponse.id);
      setState(prev => ({ ...prev, ocrStatus: initialStatus }));

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        isProcessing: false,
        error: error.response?.data?.message || 'Upload failed. Please try again.',
      }));
    }
  };

  const handleRetry = async () => {
    if (!state.uploadedFile) return;

    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      await fileService.retryOCR(state.uploadedFile.id);
      const status = await fileService.getOCRStatus(state.uploadedFile.id);
      setState(prev => ({ ...prev, ocrStatus: status }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.response?.data?.message || 'Retry failed. Please try again.',
      }));
    }
  };

  const handleViewDocument = (documentId: string) => {
    navigate(`/editor/${documentId}`);
  };

  const handleRemoveFile = () => {
    setState({
      selectedFile: null,
      uploadedFile: null,
      ocrStatus: null,
      isUploading: false,
      isProcessing: false,
      error: null,
    });
  };

  const handleStartOver = () => {
    handleRemoveFile();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload Handwritten Notes
        </h1>
        <p className="text-gray-600">
          Upload images or PDFs of your handwritten notes to convert them to editable text using OCR.
        </p>
      </div>

      <div className="space-y-6">
        {/* File Selection */}
        {!state.selectedFile && !state.uploadedFile && (
          <FileUploader
            onFileSelect={handleFileSelect}
            isUploading={state.isUploading}
          />
        )}

        {/* File Preview */}
        {state.selectedFile && !state.uploadedFile && (
          <div className="space-y-4">
            <FilePreview
              file={state.selectedFile}
              onRemove={handleRemoveFile}
            />
            
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={state.isUploading}
              >
                {state.isUploading ? 'Uploading...' : 'Upload & Process with OCR'}
              </Button>
              <Button
                variant="outline"
                onClick={handleRemoveFile}
                disabled={state.isUploading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* OCR Progress */}
        {state.uploadedFile && (
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Processing: {state.uploadedFile.originalName}
              </h3>
              <p className="text-sm text-gray-600">
                File uploaded successfully. OCR processing in progress...
              </p>
            </div>

            {state.ocrStatus && (
              <OCRProgressIndicator
                status={state.ocrStatus.status as OCRStatus}
                progress={state.ocrStatus.progress}
                message={state.ocrStatus.message}
                documentId={state.ocrStatus.documentId}
                onRetry={handleRetry}
                onViewDocument={handleViewDocument}
              />
            )}

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleStartOver}
                disabled={state.isProcessing}
              >
                Upload Another File
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-5 h-5 text-red-500 mr-3">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-red-700">{state.error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};