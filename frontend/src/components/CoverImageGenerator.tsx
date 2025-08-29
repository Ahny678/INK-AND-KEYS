import React, { useState } from "react";
import { Button } from "./Button";
import { ImageGenerationProgress } from "./ImageGenerationProgress";

interface CoverImageGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
  onUpload?: (file: File) => Promise<void>;
  initialPrompt?: string;
  title?: string;
  type?: "book" | "chapter";
}

export const CoverImageGenerator: React.FC<CoverImageGeneratorProps> = ({
  isOpen,
  onClose,
  onGenerate,
  onUpload,
  initialPrompt = "",
  title = "Generate Cover Image",
  type = "chapter",
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'ai' | 'upload'>('ai');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      if (mode === 'ai') {
        if (!prompt.trim()) {
          setError("Please enter a description for the cover image");
          setIsGenerating(false);
          return;
        }
        await onGenerate(prompt.trim());
      } else {
        if (!onUpload) {
          setError('Upload not supported');
          setIsGenerating(false);
          return;
        }
        if (!selectedFile) {
          setError('Please select an image file to upload');
          setIsGenerating(false);
          return;
        }
        await onUpload(selectedFile);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : (mode === 'ai' ? 'Failed to generate cover image' : 'Failed to upload cover image'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setPrompt("");
      setError(null);
      setMode('ai');
      setSelectedFile(null);
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          {!isGenerating && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-6">
          {isGenerating ? (
            <ImageGenerationProgress
              isGenerating={true}
              message={`${mode === 'ai' ? 'Generating' : 'Uploading'} ${type} cover image...`}
              error={error || undefined}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded-md border ${mode === 'ai' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                  onClick={() => setMode('ai')}
                  disabled={isGenerating}
                >
                  Use AI
                </button>
                <button
                  className={`px-3 py-1 rounded-md border ${mode === 'upload' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                  onClick={() => setMode('upload')}
                  disabled={isGenerating}
                >
                  Upload Image
                </button>
              </div>

              {mode === 'ai' ? (
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Describe the cover image you want to generate:
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a description for your cover image..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    disabled={isGenerating}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select an image to upload (JPEG/PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                    disabled={isGenerating}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                  />
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isGenerating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleGenerate}
                  disabled={isGenerating || (mode === 'ai' ? !prompt.trim() : !selectedFile)}
                  className="flex-1"
                >
                  {mode === 'ai' ? 'Generate Cover' : 'Upload Cover'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};