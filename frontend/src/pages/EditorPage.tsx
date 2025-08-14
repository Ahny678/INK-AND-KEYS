import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, RichTextEditor, Button, LoadingSpinner } from '@/components';
import { documentService } from '@/services/documentService';
import { useAutosave } from '@/hooks/useAutosave';
import { Document } from '@/types/document';

export const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTitleEditing, setIsTitleEditing] = useState(false);

  // Autosave hook for content
  const { saveStatus, triggerSave, updateContent } = useAutosave({
    onSave: useCallback(async (newContent: string) => {
      if (!document) return;
      
      await documentService.updateDocument(document.id, {
        content: newContent,
        title: title,
      });
    }, [document, title]),
    delay: 2000, // 2 seconds
    enabled: !!document,
  });

  // Load document on mount
  useEffect(() => {
    const loadDocument = async () => {
      if (!id) {
        // New document - create it first
        try {
          const newDoc = await documentService.createDocument({
            title: 'Untitled Document',
          });
          setDocument(newDoc);
          setTitle(newDoc.title);
          setContent(newDoc.content || '');
          // Replace URL with the new document ID
          navigate(`/editor/${newDoc.id}`, { replace: true });
        } catch (err) {
          setError('Failed to create new document');
          console.error('Error creating document:', err);
        }
      } else {
        // Load existing document
        try {
          const doc = await documentService.getDocument(id);
          setDocument(doc);
          setTitle(doc.title);
          setContent(doc.content || '');
        } catch (err) {
          setError('Failed to load document');
          console.error('Error loading document:', err);
        }
      }
      setLoading(false);
    };

    loadDocument();
  }, [id, navigate]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    updateContent(newContent);
  }, [updateContent]);

  const handleTitleSave = useCallback(async () => {
    if (!document || !title.trim()) return;

    try {
      await documentService.updateDocument(document.id, {
        title: title.trim(),
      });
      setDocument(prev => prev ? { ...prev, title: title.trim() } : null);
      setIsTitleEditing(false);
    } catch (err) {
      console.error('Error saving title:', err);
      setError('Failed to save title');
    }
  }, [document, title]);

  const handleTitleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitle(document?.title || '');
      setIsTitleEditing(false);
    }
  }, [handleTitleSave, document]);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!document) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600">
            Document not found
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Document Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              {isTitleEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={handleTitleKeyPress}
                  className="text-3xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none w-full"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-3xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => setIsTitleEditing(true)}
                  title="Click to edit title"
                >
                  {title}
                </h1>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              className="ml-4"
            >
              Back to Dashboard
            </Button>
          </div>
          
          {/* Document metadata */}
          <div className="text-sm text-gray-500 flex items-center space-x-4">
            <span>Type: {document.documentType === 'CREATED' ? 'Created' : 'OCR Processed'}</span>
            <span>Created: {new Date(document.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(document.updatedAt).toLocaleDateString()}</span>
            {document.originalFileName && (
              <span>From: {document.originalFileName}</span>
            )}
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="bg-white rounded-lg shadow">
          <RichTextEditor
            content={content}
            onContentChange={handleContentChange}
            onSave={triggerSave}
            saveStatus={saveStatus}
            className="min-h-[600px]"
          />
        </div>
      </div>
    </Layout>
  );
};