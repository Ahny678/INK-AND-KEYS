import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FileUploader } from './FileUploader';

describe('FileUploader', () => {
  const mockOnFileSelect = vi.fn();

  beforeEach(() => {
    mockOnFileSelect.mockClear();
  });

  it('renders upload area with correct text', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} />);
    
    expect(screen.getByText('Upload a file')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop or click to browse')).toBeInTheDocument();
    expect(screen.getByText(/Supports: Images \(JPG, PNG\) and PDF files/)).toBeInTheDocument();
  });

  it('shows loading state when uploading', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={true} />);
    
    expect(screen.getByText('Uploading file...')).toBeInTheDocument();
    expect(screen.queryByText('Upload a file')).not.toBeInTheDocument();
  });

  it('validates file type correctly', async () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    // Create invalid file
    const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [invalidFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid file type/)).toBeInTheDocument();
    });
    
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('validates file size correctly', async () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} maxSize={1} />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Create large file (2MB when max is 1MB)
    const largeFile = new File(['x'.repeat(2 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText(/File too large/)).toBeInTheDocument();
    });
    
    expect(mockOnFileSelect).not.toHaveBeenCalled();
  });

  it('calls onFileSelect with valid file', async () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} />);
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    // Create valid file
    const validFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    Object.defineProperty(fileInput, 'files', {
      value: [validFile],
      writable: false,
    });
    
    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnFileSelect).toHaveBeenCalledWith(validFile);
    });
  });

  it('handles drag and drop events', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} />);
    
    const dropZone = screen.getByText('Upload a file').closest('div');
    expect(dropZone).toBeInTheDocument();

    if (dropZone) {
      // Test drag over
      fireEvent.dragOver(dropZone);
      expect(screen.getByText('Drop your file here')).toBeInTheDocument();

      // Test drag leave
      fireEvent.dragLeave(dropZone);
      expect(screen.getByText('Upload a file')).toBeInTheDocument();
    }
  });
});