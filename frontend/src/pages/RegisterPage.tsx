import React from 'react';
import { Link } from 'react-router-dom';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Register for Ink & Keys</h2>
        <div className="text-center text-gray-600">
          <p>Registration form will be implemented in task 8</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};