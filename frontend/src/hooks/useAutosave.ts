import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface UseAutosaveOptions {
  onSave: (content: string) => Promise<void>;
  delay?: number; // Debounce delay in milliseconds
  enabled?: boolean;
}

interface UseAutosaveReturn {
  saveStatus: SaveStatus;
  triggerSave: () => void;
  updateContent: (content: string) => void;
  hasUnsavedChanges: boolean;
}

export const useAutosave = ({
  onSave,
  delay = 2000, // 2 seconds default
  enabled = true,
}: UseAutosaveOptions): UseAutosaveReturn => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentContent, setCurrentContent] = useState('');
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef('');
  const isSavingRef = useRef(false);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const performSave = useCallback(async (content: string) => {
    if (isSavingRef.current || content === lastSavedContentRef.current) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      await onSave(content);
      lastSavedContentRef.current = content;
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Autosave failed:', error);
      setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave]);

  const updateContent = useCallback((content: string) => {
    setCurrentContent(content);
    
    if (content !== lastSavedContentRef.current) {
      setHasUnsavedChanges(true);
      setSaveStatus('unsaved');

      if (enabled) {
        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Set new timeout for autosave
        timeoutRef.current = setTimeout(() => {
          performSave(content);
        }, delay);
      }
    }
  }, [enabled, delay, performSave]);

  const triggerSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    performSave(currentContent);
  }, [currentContent, performSave]);

  // Initialize last saved content
  useEffect(() => {
    if (currentContent && lastSavedContentRef.current === '') {
      lastSavedContentRef.current = currentContent;
    }
  }, [currentContent]);

  return {
    saveStatus,
    triggerSave,
    updateContent,
    hasUnsavedChanges,
  };
};