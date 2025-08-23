import React from 'react';
import AdminSocialManagement from './AdminSocialManagement';

// Wrapper component to maintain backward compatibility
const AdminSocialControl = ({ isStandalone = true }) => {
  return <AdminSocialManagement isStandalone={isStandalone} />;
};

export default AdminSocialControl;