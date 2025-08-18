import React from 'react';
import { useApi } from './ApiContext';
import CafeLoader, { LOADER_TYPES } from './CafeLoader';
import '../../styles/GlobalLoadingOverlay.css';

const GlobalLoadingOverlay = () => {
  const { isLoading } = useApi();
  
  // Check if any API call is loading
  const anyLoading = Object.keys(isLoading).some(key => isLoading(key));
  
  if (!anyLoading) return null;
  
  return (
    <div className="global-loading-overlay">
      <div className="global-loading-content">
        <CafeLoader 
          type={LOADER_TYPES.COFFEE_CUP} 
          text="Brewing your request..." 
          size={60} 
        />
      </div>
    </div>
  );
};

export default GlobalLoadingOverlay;