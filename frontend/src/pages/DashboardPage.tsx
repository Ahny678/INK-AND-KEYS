import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Button, 
  DocumentList, 
  EmptyState, 
  DeleteConfirmationModal 
} from '@/components';
import { documentService } from '@/services';
import { Document } from '@/types/document';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    document: Document | null;
    isDeleting: boolean;
  }>({
    isOpen: false,
    document: null,
    isDeleting: false,
  });

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedDocuments = await documentService.getDocuments();
      setDocuments(fetchedDocuments);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async () => {
    try {
      const newDocument = await documentService.createDocument({
        title: 'Untitled Document',
      });
      // Navigate to editor page with the new document
      navigate(`/editor/${newDocument.id}`);
    } catch (err) {
      console.error('Failed to create document:', err);
      setError('Failed to create document. Please try again.');
    }
  };

  const handleUploadFile = () => {
    // This will be implemented in task 11
    // For now, show a placeholder message
    alert('File upload functionality will be implemented in task 11');
  };

  const handleEditDocument = (document: Document) => {
    navigate(`/editor/${document.id}`);
  };

  const handleDeleteDocument = (document: Document) => {
    setDeleteModal({
      isOpen: true,
      document,
      isDeleting: false,
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.document) return;

    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      await documentService.deleteDocument(deleteModal.document.id);
      
      // Remove document from local state
      setDocuments(prev => 
        prev.filter(doc => doc.id !== deleteModal.document!.id)
      );
      
      // Close modal
      setDeleteModal({
        isOpen: false,
        document: null,
        isDeleting: false,
      });
    } catch (err) {
      console.error('Failed to delete document:', err);
      setError('Failed to delete document. Please try again.');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const cancelDelete = () => {
    setDeleteModal({
      isOpen: false,
      document: null,
      isDeleting: false,
    });
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your documents and notes</p>
            </div>
            
            {/* Action buttons - only show when not loading and has documents */}
            {!loading && documents.length > 0 && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleUploadFile}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload Notes
                </Button>
                <Button
                  onClick={handleCreateDocument}
                  className="flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Document
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={loadDocuments}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          {!loading && documents.length === 0 && !error ? (
            <EmptyState
              onCreateDocument={handleCreateDocument}
              onUploadFile={handleUploadFile}
            />
          ) : (
            <div className="p-6">
              <DocumentList
                documents={documents}
                loading={loading}
                onEditDocument={handleEditDocument}
                onDeleteDocument={handleDeleteDocument}
              />
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          documentTitle={deleteModal.document?.title || ''}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDeleting={deleteModal.isDeleting}
        />
      </div>
    </Layout>
  );
};