import React from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '@/components';

export const EditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? `Edit Document ${id}` : 'New Document'}
          </h1>
        </div>
        <div className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
          <p>Rich text editor will be implemented in task 10</p>
        </div>
      </div>
    </Layout>
  );
};