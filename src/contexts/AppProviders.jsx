"use client";

import React from 'react';
import { AuthProvider } from '../hooks/useAuth';
import ErrorBoundary from '../components/ErrorBoundary';

// Main App Context Provider that wraps all other providers
export const AppProviders = ({ children }) => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;
