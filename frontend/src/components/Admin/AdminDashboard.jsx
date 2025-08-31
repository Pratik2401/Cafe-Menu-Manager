import React from 'react';
import AdminControls from './AdminControls';
import ErrorBoundary from '../utils/ErrorBoundary';

const AdminDashboard = () => {
  return (
    <ErrorBoundary>
      <AdminControls />
    </ErrorBoundary>
  );
};

export default AdminDashboard;