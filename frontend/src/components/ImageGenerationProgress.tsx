import React from "react";

interface ImageGenerationProgressProps {
  isGenerating: boolean;
  progress?: number;
  message?: string;
  error?: string;
}

export const ImageGenerationProgress: React.FC<ImageGenerationProgressProps> = ({
  isGenerating,
  progress = 0,
  message = "Generating cover image...",
  error,
}) => {
  if (!isGenerating && !error) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      {error ? (
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 font-medium">Generation Failed</p>
          <p className="text-sm text-gray-600 mt-1">{error}</p>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-gray-700 font-medium">{message}</p>
          
          {progress > 0 && (
            <div className="w-64 bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-2">
            This may take a few moments...
          </p>
        </div>
      )}
    </div>
  );
};