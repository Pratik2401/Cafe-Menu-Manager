import React from 'react';
import AdminControls from './AdminControls';
import ErrorBoundary from '../utils/ErrorBoundary';

const AdminDashboard = () => {
  // Dashboard now just renders a summary/overview instead of switching between all pages
  return (
    <ErrorBoundary>
      <AdminControls />
    </ErrorBoundary>
  );
};

export default AdminDashboard;