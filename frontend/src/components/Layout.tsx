import React from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  className = '', 
  showHeader = true 
}) => {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {showHeader && <Header />}
      <main className={showHeader ? 'pt-0' : ''}>
        {children}
      </main>
    </div>
  );
};