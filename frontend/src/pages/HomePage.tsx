import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts';
import { Layout, Button } from '@/components';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Ink & Keys</h1>
          <p className="text-gray-600 mb-8">Transform your handwritten notes into digital documents</p>
          
          {isAuthenticated ? (
            <div className="space-x-4">
              <Link to="/dashboard">
                <Button variant="primary" size="lg">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Link to="/login">
                <Button variant="primary" size="lg">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="lg">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};