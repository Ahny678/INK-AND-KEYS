import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { UploadPage } from '../pages/UploadPage';
import { fileService } from '../services/fileService';

// Mock the file service
vi.mock('../services/fileService', () => ({
  fileService: {
    uploadFile: vi.fn(),
    processOCR: vi.fn(),
    getOCRStatus: vi.fn(),
    retryOCR: vi.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderUploadPage = () => {
  return render(
    <BrowserRouter>
      <UploadPage />
    </BrowserRouter>
  );
};

describe('Upload Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes full upload and OCR workflow successfully', async () => {
    // Mock successful responses
    const mockUploadResponse = {
      id: 'file-123',
      originalName: 'test.jpg',
      fileName: 'uploaded-file.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      status: 'UPLOADED' as const,
      createdAt: new Date().toISOString(),
    };

    const mockOCRStatusProcessing = {
      id: 'file-123',
      status: 'PROCESSING' as const,
      progress: 50,
      message: 'Processing image...',
      createdAt: new Date(),
    };

    const mockOCRStatusCompleted = {
      id: 'file-123',
      status: 'PROCESSED' as const,
      documentId: 'doc-456',
      message: 'OCR completed successfully',
      createdAt: new Date(),
    };

    vi.mocked(fileService.uploadFile).mockResolvedValue(mockUploadResponse);
    vi.mocked(fileService.processOCR).mockResolvedValue({
      message: 'OCR processing started',
      jobId: 'file-123',
    });
    vi.mocked(fileService.getOCRStatus)
      .mockResolvedValueOnce(mockOCRStatusProcessing)
      .mockResolvedValue(mockOCRStatusCompleted);

    renderUploadPage();

    // Verify initial state
    expect(screen.getByText('Upload Handwritten Notes')).toBeInTheDocument();
    expect(screen.getByText('Upload a file')).toBeInTheDocument();

    // Select a file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [testFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Verify file preview appears
    await waitFor(() => {
      expect(screen.getByText('test.jpg')).toBeInTheDocument();
    });

    // Click upload button
    const uploadButton = screen.getByRole('button', { name: /upload & process with ocr/i });
    fireEvent.click(uploadButton);

    // Verify upload service is called
    await waitFor(() => {
      expect(fileService.uploadFile).toHaveBeenCalledWith(testFile);
    });

    // Verify OCR processing starts
    await waitFor(() => {
      expect(fileService.processOCR).toHaveBeenCalledWith(
        'file-123',
        'uploaded-file.jpg',
        'test.jpg'
      );
    });

    // Verify processing status is shown
    await waitFor(() => {
      expect(screen.getByText('Processing with OCR...')).toBeInTheDocument();
    });

    // Wait for completion status
    await waitFor(() => {
      expect(screen.getByText('OCR processing completed')).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify view document button appears
    const viewButton = screen.getByRole('button', { name: /view document/i });
    expect(viewButton).toBeInTheDocument();

    // Click view document
    fireEvent.click(viewButton);

    // Verify navigation to editor
    expect(mockNavigate).toHaveBeenCalledWith('/editor/doc-456');
  });

  it('handles upload errors gracefully', async () => {
    // Mock upload failure
    vi.mocked(fileService.uploadFile).mockRejectedValue({
      response: {
        data: {
          message: 'File upload failed',
        },
      },
    });

    renderUploadPage();

    // Select a file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [testFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Click upload button
    const uploadButton = screen.getByRole('button', { name: /upload & process with ocr/i });
    fireEvent.click(uploadButton);

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText('File upload failed')).toBeInTheDocument();
    });
  });

  it('handles OCR processing failures with retry', async () => {
    // Mock successful upload but failed OCR
    const mockUploadResponse = {
      id: 'file-123',
      originalName: 'test.jpg',
      fileName: 'uploaded-file.jpg',
      mimeType: 'image/jpeg',
      size: 1024,
      status: 'UPLOADED' as const,
      createdAt: new Date().toISOString(),
    };

    const mockOCRStatusFailed = {
      id: 'file-123',
      status: 'FAILED' as const,
      message: 'OCR processing failed',
      createdAt: new Date(),
    };

    const mockOCRStatusRetrySuccess = {
      id: 'file-123',
      status: 'PROCESSED' as const,
      documentId: 'doc-456',
      message: 'OCR completed successfully',
      createdAt: new Date(),
    };

    vi.mocked(fileService.uploadFile).mockResolvedValue(mockUploadResponse);
    vi.mocked(fileService.processOCR).mockResolvedValue({
      message: 'OCR processing started',
      jobId: 'file-123',
    });
    vi.mocked(fileService.getOCRStatus)
      .mockResolvedValueOnce(mockOCRStatusFailed)
      .mockResolvedValue(mockOCRStatusRetrySuccess);
    vi.mocked(fileService.retryOCR).mockResolvedValue({
      message: 'OCR retry started',
      jobId: 'file-123',
    });

    renderUploadPage();

    // Select and upload file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [testFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    const uploadButton = screen.getByRole('button', { name: /upload & process with ocr/i });
    fireEvent.click(uploadButton);

    // Wait for failed status
    await waitFor(() => {
      expect(screen.getAllByText('OCR processing failed')).toHaveLength(2);
    });

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    // Verify retry service is called
    expect(fileService.retryOCR).toHaveBeenCalledWith('file-123');

    // Wait for success after retry
    await waitFor(() => {
      expect(screen.getByText('OCR processing completed')).toBeInTheDocument();
    });
  });

  it('validates file types and shows appropriate errors', async () => {
    renderUploadPage();

    // Try to upload invalid file type
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/)).toBeInTheDocument();
    });

    // Verify upload button is not available
    expect(screen.queryByRole('button', { name: /upload & process with ocr/i })).not.toBeInTheDocument();
  });
});