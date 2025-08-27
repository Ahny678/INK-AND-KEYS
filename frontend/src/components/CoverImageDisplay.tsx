import React, { useState } from "react";

interface CoverImageDisplayProps {
  imageUrl?: string;
  alt: string;
  className?: string;
  size?: "small" | "medium" | "large";
  showPlaceholder?: boolean;
  onImageError?: () => void;
  onClick?: () => void;
}

export const CoverImageDisplay: React.FC<CoverImageDisplayProps> = ({
  imageUrl,
  alt,
  className = "",
  size = "medium",
  showPlaceholder = true,
  onImageError,
  onClick,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sizeClasses = {
    small: "w-16 h-20",
    medium: "w-32 h-40",
    large: "w-48 h-60",
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    onImageError?.();
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const shouldShowPlaceholder = !imageUrl || hasError;

  return (
    <div 
      className={`${sizeClasses[size]} ${className} relative overflow-hidden rounded-lg border border-gray-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      title={onClick ? 'Click to generate/change cover' : undefined}
    >
      {shouldShowPlaceholder && showPlaceholder ? (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <svg 
              className="w-8 h-8 mx-auto text-gray-400 mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
              />
            </svg>
            <p className="text-xs text-gray-500">{onClick ? 'Click to Generate' : 'No Cover'}</p>
          </div>
        </div>
      ) : (
        <>
          {isLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={alt}
            className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {onClick && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};