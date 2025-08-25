import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Book } from '@/types/book';

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string }) => void;
  isUpdating: boolean;
  book: Book | null;
}

export const EditBookModal: React.FC<EditBookModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isUpdating,
  book,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Update form fields when book changes
  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setDescription(book.description || '');
    }
  }, [book]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
    });
    
    // Reset form
    setTitle('');
    setDescription('');
  };

  const handleClose = () => {
    if (!isUpdating) {
      setTitle('');
      setDescription('');
      onClose();
    }
  };

  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Edit Book</h3>
            <button
              onClick={handleClose}
              disabled={isUpdating}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="book-title" className="block text-sm font-medium text-gray-700 mb-2">
                Book Title <span className="text-red-500">*</span>
              </label>
              <input
                id="book-title"
                name="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter book title..."
                required
                disabled={isUpdating}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="book-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                id="book-description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter book description..."
                disabled={isUpdating}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUpdating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!title.trim() || isUpdating}
                className="flex-1"
              >
                {isUpdating ? 'Updating...' : 'Update Book'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
