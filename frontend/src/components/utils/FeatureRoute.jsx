import React from 'react';
import { Navigate } from 'react-router-dom';
import { getAdminFeatures } from '../../utils/tokenManager';

const FeatureRoute = ({ feature, children, redirectTo = '/admin/dashboard' }) => {
  const adminFeatures = getAdminFeatures();
  
  // Check if the required feature is enabled
  if (!adminFeatures[feature]) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
};

export default FeatureRoute;