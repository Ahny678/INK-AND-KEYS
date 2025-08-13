import React from 'react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your documents and notes</p>
        </div>
        <div className="text-center text-gray-600 bg-white rounded-lg shadow p-8">
          <p>Dashboard interface will be implemented in task 9</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};