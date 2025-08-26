import React, { useEffect, useState } from "react";

interface TextSelectionMenuProps {
  selectedText: string;
  position: { x: number; y: number };
  onUseCoverImage: (text: string) => void;
  onClose: () => void;
}

export const TextSelectionMenu: React.FC<TextSelectionMenuProps> = ({
  selectedText,
  position,
  onUseCoverImage,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (selectedText.trim()) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [selectedText]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.text-selection-menu')) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible || !selectedText.trim()) {
    return null;
  }

  const handleUseCoverImage = () => {
    onUseCoverImage(selectedText);
    onClose();
  };

  return (
    <div
      className="text-selection-menu absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-2"
      style={{
        left: position.x,
        top: position.y - 50,
        minWidth: '200px',
      }}
    >
      <button
        onClick={handleUseCoverImage}
        className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 rounded flex items-center space-x-2"
        title="Generate cover image from selected text"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Use as cover image</span>
      </button>
    </div>
  );
};