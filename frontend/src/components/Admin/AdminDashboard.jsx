import React from 'react';
import AdminControls from './AdminControls';
import ErrorBoundary from '../utils/ErrorBoundary';
import CacheMonitor from '../utils/CacheMonitor';

const AdminDashboard = () => {
  return (
    <ErrorBoundary>
      <AdminControls />
      <CacheMonitor />
    </ErrorBoundary>
  );
};

export default AdminDashboard;