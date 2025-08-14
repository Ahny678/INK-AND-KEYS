import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DocumentCard } from './DocumentCard';
import { Document } from '@/types/document';

const mockDocument: Document = {
  id: '1',
  title: 'Test Document',
  content: '<p>This is test content for the document</p>',
  userId: 'user1',
  documentType: 'CREATED',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T10:00:00Z',
};

const mockOCRDocument: Document = {
  id: '2',
  title: 'OCR Document',
  content: 'This is OCR processed content',
  userId: 'user1',
  documentType: 'OCR_PROCESSED',
  originalFileName: 'handwritten-notes.jpg',
  createdAt: '2024-01-01T10:00:00Z',
  updatedAt: '2024-01-01T11:00:00Z',
};

describe('DocumentCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnDelete.mockClear();
  });

  it('should render document information correctly', () => {
    render(
      <DocumentCard
        document={mockDocument}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.getByText('Created Document')).toBeInTheDocument();
    expect(screen.getByText(/This is test content/)).toBeInTheDocument();
  });

  it('should render OCR document with original filename', () => {
    render(
      <DocumentCard
        document={mockOCRDocument}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByRole('heading', { name: 'OCR Document' })).toBeInTheDocument();
    expect(screen.getByText('from handwritten-notes.jpg')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <DocumentCard
        document={mockDocument}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Edit'));
    expect(mockOnEdit).toHaveBeenCalledWith(mockDocument);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(
      <DocumentCard
        document={mockDocument}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnDelete).toHaveBeenCalledWith(mockDocument);
  });

  it('should show updated date when different from created date', () => {
    render(
      <DocumentCard
        document={mockOCRDocument}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/Created:/)).toBeInTheDocument();
    expect(screen.getByText(/Updated:/)).toBeInTheDocument();
  });

  it('should handle empty content gracefully', () => {
    const emptyDocument = { ...mockDocument, content: '' };
    render(
      <DocumentCard
        document={emptyDocument}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('No content yet')).toBeInTheDocument();
  });
});