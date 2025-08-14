import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { RichTextEditor } from './RichTextEditor';

// Mock TipTap editor
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
    getHTML: vi.fn(() => '<p>Test content</p>'),
    commands: {
      setContent: vi.fn(),
      focus: vi.fn(() => ({
        toggleBold: vi.fn(() => ({ run: vi.fn() })),
        toggleItalic: vi.fn(() => ({ run: vi.fn() })),
        toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
        toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
        toggleHeading: vi.fn(() => ({ run: vi.fn() })),
      })),
    },
    chain: vi.fn(() => ({
      focus: vi.fn(() => ({
        toggleBold: vi.fn(() => ({ run: vi.fn() })),
        toggleItalic: vi.fn(() => ({ run: vi.fn() })),
        toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
        toggleOrderedList: vi.fn(() => ({ run: vi.fn() })),
        toggleHeading: vi.fn(() => ({ run: vi.fn() })),
      })),
    })),
    isActive: vi.fn(() => false),
  })),
  EditorContent: () => <div data-testid="editor-content">Editor Content</div>,
}));

vi.mock('@tiptap/starter-kit', () => ({
  default: {},
}));

describe('RichTextEditor', () => {
  const defaultProps = {
    content: '<p>Initial content</p>',
    onContentChange: vi.fn(),
    onSave: vi.fn(),
    saveStatus: 'saved' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render editor with toolbar', () => {
    render(<RichTextEditor {...defaultProps} />);
    
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByText('H1')).toBeInTheDocument();
    expect(screen.getByText('H2')).toBeInTheDocument();
    expect(screen.getByText('H3')).toBeInTheDocument();
    expect(screen.getByText('• List')).toBeInTheDocument();
    expect(screen.getByText('1. List')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('should display correct save status', () => {
    const { rerender } = render(<RichTextEditor {...defaultProps} saveStatus="saved" />);
    expect(screen.getByText('All changes saved')).toBeInTheDocument();

    rerender(<RichTextEditor {...defaultProps} saveStatus="saving" />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();

    rerender(<RichTextEditor {...defaultProps} saveStatus="unsaved" />);
    expect(screen.getByText('Unsaved changes')).toBeInTheDocument();

    rerender(<RichTextEditor {...defaultProps} saveStatus="error" />);
    expect(screen.getByText('Error saving')).toBeInTheDocument();
  });

  it('should call onSave when save button is clicked', () => {
    const onSave = vi.fn();
    render(<RichTextEditor {...defaultProps} onSave={onSave} />);
    
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('should disable save button when saving', () => {
    render(<RichTextEditor {...defaultProps} saveStatus="saving" />);
    
    const saveButton = screen.getByText('Save');
    expect(saveButton).toBeDisabled();
  });

  it('should apply correct CSS classes for save status', () => {
    const { rerender } = render(<RichTextEditor {...defaultProps} saveStatus="saved" />);
    expect(screen.getByText('All changes saved')).toHaveClass('text-green-600');

    rerender(<RichTextEditor {...defaultProps} saveStatus="saving" />);
    expect(screen.getByText('Saving...')).toHaveClass('text-blue-600');

    rerender(<RichTextEditor {...defaultProps} saveStatus="unsaved" />);
    expect(screen.getByText('Unsaved changes')).toHaveClass('text-yellow-600');

    rerender(<RichTextEditor {...defaultProps} saveStatus="error" />);
    expect(screen.getByText('Error saving')).toHaveClass('text-red-600');
  });

  it('should have editor content area', () => {
    render(<RichTextEditor {...defaultProps} />);
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });
});