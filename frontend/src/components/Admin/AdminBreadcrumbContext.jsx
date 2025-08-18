import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

// Create context
const BreadcrumbContext = createContext();

// Provider component
export const BreadcrumbProvider = ({ children }) => {
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);
  // No loading state needed

  // Use useCallback to prevent recreation of this function on every render
  const updateBreadcrumb = useCallback((items) => {
    setBreadcrumbItems(items);
  }, []); // Ensure no unnecessary dependencies

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    breadcrumbItems,
    updateBreadcrumb,
  }), [breadcrumbItems, updateBreadcrumb]); // Only depend on breadcrumbItems and updateBreadcrumb

  return (
    <BreadcrumbContext.Provider value={contextValue}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

// Hook for using the breadcrumb context
export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
};