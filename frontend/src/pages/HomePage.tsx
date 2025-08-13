import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Ink & Keys</h1>
        <p className="text-gray-600 mb-8">Transform your handwritten notes into digital documents</p>
        <div className="space-x-4">
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};