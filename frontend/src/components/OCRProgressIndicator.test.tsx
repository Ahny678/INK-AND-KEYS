import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OCRProgressIndicator } from './OCRProgressIndicator';

describe('OCRProgressIndicator', () => {
  const mockOnRetry = vi.fn();
  const mockOnViewDocument = vi.fn();

  beforeEach(() => {
    mockOnRetry.mockClear();
    mockOnViewDocument.mockClear();
  });

  it('renders uploaded status correctly', () => {
    render(
      <OCRProgressIndicator 
        status="UPLOADED" 
        onRetry={mockOnRetry}
        onViewDocument={mockOnViewDocument}
      />
    );
    
    expect(screen.getByText('File uploaded successfully')).toBeInTheDocument();
  });

  it('renders processing status with progress', () => {
    render(
      <OCRProgressIndicator 
        status="PROCESSING" 
        progress={45}
        message="Processing image..."
        onRetry={mockOnRetry}
        onViewDocument={mockOnViewDocument}
      />
    );
    
    expect(screen.getByText('Processing with OCR...')).toBeInTheDocument();
    expect(screen.getByText('Processing image...')).toBeInTheDocument();
    expect(screen.getByText('45% complete')).toBeInTheDocument();
  });

  it('renders processed status with view document button', () => {
    render(
      <OCRProgressIndicator 
        status="PROCESSED" 
        documentId="doc-123"
        onRetry={mockOnRetry}
        onViewDocument={mockOnViewDocument}
      />
    );
    
    expect(screen.getByText('OCR processing completed')).toBeInTheDocument();
    
    const viewButton = screen.getByRole('button', { name: /view document/i });
    expect(viewButton).toBeInTheDocument();
    
    fireEvent.click(viewButton);
    expect(mockOnViewDocument).toHaveBeenCalledWith('doc-123');
  });

  it('renders failed status with retry button', () => {
    render(
      <OCRProgressIndicator 
        status="FAILED" 
        message="Error processing image"
        onRetry={mockOnRetry}
        onViewDocument={mockOnViewDocument}
      />
    );
    
    expect(screen.getByText('OCR processing failed')).toBeInTheDocument();
    expect(screen.getByText('Error processing image')).toBeInTheDocument();
    
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('applies correct styling for different statuses', () => {
    const { rerender } = render(
      <OCRProgressIndicator 
        status="UPLOADED" 
        onRetry={mockOnRetry}
        onViewDocument={mockOnViewDocument}
      />
    );
    
    expect(screen.getByText('File uploaded successfully')).toHaveClass('text-blue-600');
    
    rerender(
      <OCRProgressIndicator 
        status="PROCESSED" 
        onRetry={mockOnRetry}
        onViewDocument={mockOnViewDocument}
      />
    );
    
    expect(screen.getByText('OCR processing completed')).toHaveClass('text-green-600');
    
    rerender(
      <OCRProgressIndicator 
        status="FAILED" 
        onRetry={mockOnRetry}
        onViewDocument={mockOnViewDocument}
      />
    );
    
    expect(screen.getByText('OCR processing failed')).toHaveClass('text-red-600');
  });
});